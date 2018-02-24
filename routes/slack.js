const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const knex = require('../db');
const constants = require('../constants.js')

const router = express.Router();
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

// helper function to send messages to Slack response_url
function sendMessageToSlackResponseURL(responseURL, JSONmessage) {
  const postOptions = {
    uri: responseURL,
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    json: JSONmessage
  };

  request(postOptions, (error, response, body) => {
    if (error) {
      // TODO: handle error
      console.error(error);
    }
  });
}

// Handle add to slack request
// VERB: GET
// PATH: /slack/auth
router.get('/auth', (req, res) => {

  // retrieve Slack verification code from req.query.code
  // send request back with verification code, client ID, and client secret
  // via https://slack.com/api/oauth.access
  const options = {
    uri:
      'https://slack.com/api/oauth.access?code='
      +req.query.code
      +'&client_id='+process.env.SLACK_CLIENT_ID
      +'&client_secret='+process.env.SLACK_CLIENT_SECRET,
    method: 'GET'
  };

  // send request back and wait for JSON response from Slack
  request(options, (error, response, body) => {
    const JSONresponse = JSON.parse(body);
    if (!JSONresponse.ok) {

      // TODO: handle error
      res.send('Authentication Error');
    }
    else {

      // TODO: add to slack was successful (redirect to thank you page?)
      res.send('Add to Slack successful.')

      // save slack team to database
      knex('teams').insert({
        slack_team_name: JSONresponse.team_name,
        slack_team_id: JSONresponse.team_id,
        slack_bot_user_id: JSONresponse.bot.bot_user_id,
        slack_bot_access_token: JSONresponse.bot.bot_access_token
      })
      .then(() => {
        console.log('Slack team added to the database.');
      })
      .catch(error => {
        // TODO: handle error
        console.error(error);
      });
    }
  });

});

// Handle slash command
// VERB: POST
// PATH: /slack/commands/shokubot
router.post('/commands/shokubot', (req, res) => {

  // respond with status 200
  res.status(200).end();

  // get request body and response_url
  const reqBody = req.body;
  const responseURL = reqBody.response_url;

  // verify token
  if (reqBody.token != process.env.SLACK_VERIFICATION_TOKEN) {
    // send error if invalid token
    res.status(403).end('Access Forbidden');
  }
  else {

    // find the slack team in the database
    knex.select('id')
      .from('teams')
      .where('slack_team_id', reqBody.team_id)
      .then(teams => {
        // add user to database
        return knex('users').insert({
          slack_user_id: reqBody.user_id,
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

    // process command argument
    const arg = reqBody.text.trim();

    switch (arg) {
      case 'now':
        message.attachments = [
          {
            ...constants.autonomy
          }
        ];
        break;
      case 'set':
        message.text = 'Set your reminders.';
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

    sendMessageToSlackResponseURL(responseURL, message);
  }

});

// Handles button clicks from interactive messages
// VERB: POST
// PATH: /slack/actions
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


module.exports = router;
