const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const knex = require('../db');
const constants = require('../constants.js')

// TODO: add slack controller actions
// const { create } = require('../controllers/slack');

const teamController = require('../controllers/team_controller');


const router = express.Router();
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

// helper function to set reminders for each user
function setReminder(slackUserId, dayAndTime) {

  // make sure we find a time
  const time = dayAndTime.match(/([1-9]|10|11|12)(:[0-5][0-9])?(am|pm)/i);
  console.log('setReminder: time ', time);

  if (!time) {
    return false;
  }

  // check days
  const everyday = dayAndTime.match(/every\s*day/i);
  const weekday = dayAndTime.match(/week\s*day/i);

  const range = dayAndTime.match(/(sun|mon|tues|wednes|thurs|fri|satur)day\s+to\s+(sun|mon|tues|wednes|thurs|fri|satur)day/i);

  const list = dayAndTime.match(/(sun|mon|tues|wednes|thurs|fri|satur)days?((,|,\s+and|\s+and)\s+(sun|mon|tues|wednes|thurs|fri|satur)days?)*/i);

  console.log('setReminder: everyday ', everyday);
  console.log('setReminder: weekday ', weekday);
  console.log('setReminder: range ', range);
  console.log('setReminder: list ', list);

  if (!everyday && !weekday && !range && !list) {
    return false;
  }

  // get hours and minutes
  let hours = parseInt(time[1]);
  const minutes = time[2] !== undefined ? parseInt(time[2].slice(1)) : 0;
  if (time[3] === 'am' && hours === 12) {
    hours = 0;
  }
  else if (time[3] === 'pm' && hours < 12) {
    hours += 12;
  }

  // convert to seconds
  let seconds = (hours * 60 + minutes) * 60;

  console.log('setReminder: hours ', hours);
  console.log('setReminder: minutes ', minutes);
  console.log('setReminder: seconds ', seconds);

  // get list of days
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  let days = Array.from({ length: 7 });
  days.fill(false);

  // helper map
  const dayToIndex = {
    sun: 0,
    mon: 1,
    tues: 2,
    wednes: 3,
    thurs: 4,
    fri: 5,
    satur: 6
  };

  if (everyday) {
    days.fill(true);
  }
  else if (weekday) {
    days.fill(true, 1, 6);
  }
  else if (range) {
    const start = dayToIndex[range[1]];
    const end = dayToIndex[range[2]] + 1;
    days.fill(true, start, end);
  }
  else if (list) {
    const listStr = list[0];
    const listArr = listStr.match(/(sun|mon|tues|wednes|thurs|fri|satur)/gi);
    listArr.forEach(day => {
      const index = dayToIndex[day];
      days[index] = true;
    });
  }

  // store reminders in an object
  let reminders = {
    days: days,
    seconds: seconds
  };

  console.log('setReminder: reminders ', reminders);


  // get the users slack bot access token to request user's timezone offset
  knex.select('slack_bot_access_token')
    .from('teams')
    .innerJoin('users', 'teams.id', 'users.team_id')
    .where('slack_user_id', slackUserId)
    .then(tokens => {

      const options = {
        uri:
          'https://slack.com/api/users.info?token='
          +tokens[0].slack_bot_access_token
          +'&user='+slackUserId,
        method: 'get'
      };

      // request the user's timezone offset
      request(options, (error, response, body) => {

        const JSONresponse = JSON.parse(body);
        if (!JSONresponse.ok) {

          // TODO: handle error
          console.error(JSONresponse.error);
        }
        else {

          // conversion from user time to our time
          // getTimezoneOffset returns minutes; +ive if behind, -ive if ahead
          // tz_offset is in seconds; -ive if behind, +ive if ahead
          // save conversion in seconds
          const serverTime = new Date();
          const serverTimezoneOffset = serverTime.getTimezoneOffset() * 60;
          const conversion = (-serverTimezoneOffset - JSONresponse.user.tz_offset);

          // convert all reminders
          reminders.seconds += conversion;

          // if seconds is greater than one day, i.e., rollover
          const secondsPerDay = 24 * 60 * 60;
          if (reminders.seconds > secondsPerDay) {
            reminders.seconds -= secondsPerDay;
            const saturday = reminders.days.pop();
            reminders.days.unshift(saturday);
          }
          else if (reminders.seconds < 0) {
            eminders.seconds += secondsPerDay;
            const sunday = reminder.days.shift();
            reminders.days.push(sunday);
          }

          // save all reminder times in server time
          knex('users')
            .where('slack_user_id', slackUserId)
            .update({
              reminders: JSON.stringify(reminders)
            })
            .then(() => {
              console.log('Reminders saved to the database.');
            })
            .catch(error => {
              // TODO: handle error
              console.error(error);
            });

          // calculate milliseconds to next reminder
          let today = new Date();
          let dayIndex = today.getDay();
          let daysToGo = 0;

          const todayInSeconds = (today.getHours() * 60 + today.getMinutes()) * 60;
          if (todayInSeconds > reminders.seconds) {
            daysToGo++;
            dayIndex++;
            if (dayIndex > 6) {
              dayIndex = 0;
            }
          }

          while (!reminders.days[dayIndex]) {
            daysToGo++;
            dayIndex++;
            if (dayIndex > 6) {
              dayIndex = 0;
            }
          }

          // set the timer
          const millisecondsToGo = (daysToGo * 24 * 60 * 60 + reminders.seconds - todayInSeconds) * 1000;
          console.log('setReminder: millisecondsToGo', millisecondsToGo);
          setTimeout((slackUserId, slackBotAccessToken) => {

              console.log('setReminder: sending postMessage request');

              // get the DM channel for this user
              const options = {
                uri:
                  'https://slack.com/api/im.list?token='
                  +slackBotAccessToken,
                method: 'get'
              };

              request(options, (error, response, body) => {

                const JSONresponse = JSON.parse(body);
                if (!JSONresponse.ok) {

                  // TODO: handle error
                  console.error(JSONresponse.error);
                }
                else {

                  console.log('Received im.list response.');


                  for (let i=0; i<JSONresponse.ims.length; i++) {
                    if (JSONresponse.ims[i].user === slackUserId) {

                      // trigger question sequence when timer expires
                      const options = {
                        uri: 'https://slack.com/api/chat.postMessage',
                        method: 'post',
                        headers: {
                          'Content-type': 'application/json',
                          'Authorization': 'Bearer '+slackBotAccessToken
                        },
                        json: {
                          channel: JSONresponse.ims[i].id,
                          attachments: [
                            {
                              ...constants.autonomy
                            }
                          ],
                          text: 'Here are your questions for today!'
                        }
                      };

                      request(options, (error, response, body) => {
                        console.log('Received response from postMessage.');
                        if (error) {
                          // TODO: handle error
                          console.error(error);
                        }
                      });


                      break;
                    }
                  }
                }
              });

            },
            millisecondsToGo,
            slackUserId,
            tokens[0].slack_bot_access_token
          );

        }

      });

    })
    .catch(error => {
      // TODO: handle error
      console.log(error);
    });

  return true;
}

// helper function to send messages to Slack response_url
function sendMessageToSlackResponseURL(responseURL, JSONmessage) {
  const options = {
    uri: responseURL,
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    json: JSONmessage
  };

  request(options, (error, response, body) => {
    if (error) {
      // TODO: handle error
      console.error(error);
    }
  });
}

// Handle add to slack request
// VERB: GET
// PATH: /slack/team/create
router.get('/team/create', teamController.create);

// Handle slash command
// VERB: POST
// PATH: /slack/commands/shokubot
router.post('/commands/shokubot', (req, res) => {

  // respond with status 200
  res.status(200).end();

  // get request body
  const reqBody = req.body;

  // verify token
  if (reqBody.token != process.env.SLACK_VERIFICATION_TOKEN) {
    // send error if invalid token
    res.status(403).end('Access Forbidden');
  }
  else {

    // Get slack user id
    const slackUserId = reqBody.user_id;

    // find the slack team in the database
    knex.select('id')
      .from('teams')
      .where('slack_team_id', reqBody.team_id)
      .then(teams => {
        // add user to the database
        return knex('users').insert({
          slack_user_id: slackUserId,
          slack_user_name: reqBody.user_name,
          team_id: teams[0].id
        });
      })
      .then(() => {
        console.log('Slack user added to the database.');
      })
      .catch(error => {
        // TODO: handle error
        console.error(error);
      });

    // set up response message
    let message = {
      response_type: 'ephemeral'
    };

    // process command arguments
    const args = reqBody.text.trim();
    let firstArg = args;
    let remainingArgs = '';

    const spaceIndex = args.indexOf(' ');
    if (spaceIndex !== -1) {
      firstArg = args.slice(0, spaceIndex);
      remainingArgs = args.slice(spaceIndex).trim();
    }

    switch (firstArg) {
      case 'now':
        message.attachments = [
          {
            ...constants.autonomy
          }
        ];
        break;
      case 'remind':
        if (setReminder(slackUserId, remainingArgs)) {
          message.text = `:thumbsup: I've set your reminders. Your next reminder is...`;
        }
        else {
          message.attachments = [
            {
              ...constants.remind
            }
          ];
        }
        break;
      case 'pause':
        message.text = 'Pause your reminders.';
        break;
      case 'resume':
        message.text = 'Resume your reminders.';
        break;
      case 'stop':
        message.text = 'Stop your reminders.';
        break;
      default:
        message.attachments = [
          {
            ...constants.help
          }
        ];
    }

    sendMessageToSlackResponseURL(reqBody.response_url, message);
  }

});

// Handles button clicks from interactive messages
// VERB: POST
// PATH: /slack/actions
// TODO: make callback async, i.e., async (req, res) => ...
router.post('/actions', urlEncodedParser, (req, res) => {
  // respond with ok status
  res.status(200).end();

  // set up message
  let message = {
    replace_original: true
  };

  // parse payload
  const actionJSONPayload = JSON.parse(req.body.payload);
  const slack_user_id = actionJSONPayload.user.id;

  // find the slack user in the database
  // if method is async, can use await and don't need 'then'
  // const users = await knex.select('id')
  knex.select('id')
    .from('users')
    .where('slack_user_id', slack_user_id)
    .then(users => {

      const userId = users[0].id;
      const callbackId = actionJSONPayload.callback_id;
      const answer = actionJSONPayload.actions[0].value === 'yes' ? true : false;

      // save response and send next message
      switch (callbackId) {

        case constants.autonomy.callback_id:
          knex('answers').insert({
            user_id: userId,
            autonomy: answer
          })
          .then(() => {
            console.log('Autonomy answer saved to the database.');
          })
          .catch(error => {
            // TODO: handle error
            console.error(error);
          });

          message.attachments = [
            {
              ...constants.complexity
            }
          ];
          break;

        case constants.complexity.callback_id:

          // if method is async, can use await and don't need 'then'
          // const answers = await knex.select()
          knex.select()
            .from('answers')
            .where('user_id', userId)
            .orderBy('updated_at', 'desc')
            .limit(1)
            .then(answers => {
              return knex('answers')
              .where('id', answers[0].id)
              .update({
                complexity: answer
              });
            })
            .then(() => {
              console.log('Complexity answer saved to the database.');
            })
            .catch(error => {
              // TODO: handle error
              console.error(error);
            });

          message.attachments = [
            {
              ...constants.reward
            }
          ];
          break;

        case constants.reward.callback_id:
          knex.select()
            .from('answers')
            .where('user_id', userId)
            .orderBy('updated_at', 'desc')
            .limit(1)
            .then(answers => {
              return knex('answers')
              .where('id', answers[0].id)
              .update({
                reward: answer
              });
            })
            .then(() => {
              console.log('Reward answer saved to the database.');
            })
            .catch(error => {
              // TODO: handle error
              console.error(error);
            });

            message.attachments = [
              {
                ...constants.done
              }
            ];
          break;

        default:
          message.text = 'Sorry, something went wrong.';
          break;
      }

      sendMessageToSlackResponseURL(actionJSONPayload.response_url, message);
    })
    .catch(error => {
      // TODO: handle error
      console.error(error);
    });
});

// TODO:This file should only call controller actions
// router.post('/path', create)


module.exports = router;
