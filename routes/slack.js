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
      knex.insert({
        slack_team_name: JSONresponse.team_name,
        slack_team_id: JSONresponse.team_id,
        slack_bot_user_id: JSONresponse.bot.bot_user_id,
        slack_bot_access_token: JSONresponse.bot.bot_access_token
      })
      .into('teams')
      .catch(error => {
        // TODO: handle error
        console.error(error);
      })
      .then(() => {
        console.log('Slack team added successfully.');
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

  // check callback_id
  const callback_id = actionJSONPayload.callback_id;

  // send next message
  switch (callback_id) {
    case constants.autonomy.callback_id:
      message.attachments = [
        {
          ...constants.complexity
        }
      ];
      break;
    case constants.complexity.callback_id:
      message.attachments = [
        {
          ...constants.reward
        }
      ];
      break;
    case constants.reward.callback_id:
      message.attachments = [
        {
          ...constants.done
        }
      ];
      break;
    default:
      break;
  }

  // respond with message
  // const message = {
  //   'text': actionJSONPayload.user.name
  //     +' clicked: '
  //     +actionJSONPayload.actions[0].name,
  //   'replace_original': false
  // };

  sendMessageToSlackResponseURL(actionJSONPayload.response_url, message);
});


module.exports = router;
