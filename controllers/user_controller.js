const requestPromise = require('../helpers/request_promise');

const {
  sendToSlackResponseUrl,
  setNextReminder,
  cancelReminders
} = require('../helpers/helper_functions');

const Team = require('../models/team');
const User = require('../models/user');
const Content = require('../content.js');

module.exports = {

  async update (req, res) {

    // private function to parse days and time from user string
    function getDaysAndTime(daysAndTime) {

      // make sure we find a time
      const time = daysAndTime.match(/([1-9]|10|11|12)(:[0-5][0-9])?(am|pm)/i);
      if (!time) {
        return null;
      }

      // check days
      const everyday = daysAndTime.match(/every\s*day/i);
      const weekday = daysAndTime.match(/week\s*day/i);

      const range = daysAndTime.match(/(sun|mon|tues|wednes|thurs|fri|satur)day\s+to\s+(sun|mon|tues|wednes|thurs|fri|satur)day/i);

      const list = daysAndTime.match(/(sun|mon|tues|wednes|thurs|fri|satur)days?((,|,\s+and|\s+and)\s+(sun|mon|tues|wednes|thurs|fri|satur)days?)*/i);

      if (!everyday && !weekday && !range && !list) {
        return null;
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

      // get list of days
      // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      let days = Array.from({ length: 7 });
      days.fill(false);

      // helper map
      const dayToIndex = { sun: 0, mon: 1, tues: 2, wednes: 3, thurs: 4, fri: 5, satur: 6 };

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

      return { days: days, seconds: seconds };
    }


    // private function to convert and save reminders to server time
    function setReminders(slackUserId, reminders) {

      // get the team's slack bot access token to request user's timezone offset
      return Team.getSlackBotAccessToken(slackUserId)
        .then(tokens => {

          const options = {
            uri:
              'https://slack.com/api/users.info?token='
              +tokens[0].slack_bot_access_token
              +'&user='+slackUserId,
            method: 'get'
          };

          // request the user's timezone offset
          return requestPromise(options);
        })
        .then(response => {

          // conversion from user time to server time
          // getTimezoneOffset returns minutes; positive if behind, negative if ahead
          // tz_offset is in seconds, but is negative if behind, positive if ahead
          // save conversion in seconds
          const serverTime = new Date();
          const serverTimezoneOffset = serverTime.getTimezoneOffset() * 60;
          const conversion = (-serverTimezoneOffset - response.user.tz_offset);

          // convert reminders
          reminders.seconds += conversion;

          // if seconds is greater than one day, i.e., rollover
          const secondsPerDay = 24 * 60 * 60;
          if (reminders.seconds > secondsPerDay) {
            reminders.seconds -= secondsPerDay;
            const saturday = reminders.days.pop();
            reminders.days.unshift(saturday);
          }
          else if (reminders.seconds < 0) {
            reminders.seconds += secondsPerDay;
            const sunday = reminders.days.shift();
            reminders.days.push(sunday);
          }

          return User.setReminders(slackUserId, reminders);
        })
        .then(() => {
          return new Promise(resolve => {
            resolve(reminders);
          });
        })
        .catch(error => {
          return new Promise(reject => {
            reject(error);
          });
        });
    }


    // Handle remind slash command
    // respond with status 200
    res.status(200).end();

    // get request body
    const reqBody = req.body;
    const token = reqBody.token;

    // verify token
    if (token != process.env.SLACK_VERIFICATION_TOKEN) {
      // send error if invalid token
      res.status(403).end('Access Forbidden');
    }
    else {

      // Get slack user id
      const slackUserId = reqBody.user_id;
      const slackUserName = reqBody.user_name;
      const slackTeamId = reqBody.team_id;

      try {
        // find the slack team in the database and add new user, or find existing user
        const teams = await Team.findBySlackTeamId(slackTeamId);
        await User.create(slackUserId, slackUserName, teams[0].id);

        console.log('Slack user added successfully');
      }
      catch(error) {
        console.error(error);
      }
      finally {
        console.log('Slack user added successfully for found existing user');

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
                ...Content.autonomy
              }
            ];
            break;
          case 'remind':
            const reminders = getDaysAndTime(remainingArgs);
            if (reminders !== null) {

              try {
                await setReminders(slackUserId, reminders);
                console.log('Reminders saved to the database.');
                setNextReminder(slackUserId);
              }
              catch(error) {
                console.error(error);
              }

              message.text = `:thumbsup: I've set your reminders.`;
            }
            else {
              message.attachments = [
                {
                  ...Content.remind
                }
              ];
            }
            break;
          case 'pause':
            cancelReminders(slackUserId);
            message.text = `:thumbsup: I've paused your reminders.`;
            break;
          case 'unpause':
            setNextReminder(slackUserId);
            message.text = `:thumbsup: I've unpaused your reminders.`;
            break;
          default:
            message.attachments = [
              {
                ...Content.help
              }
            ];
        }

        const responseUrl = reqBody.response_url;
        sendToSlackResponseUrl(responseUrl, message);
      }

    }
  }

}
