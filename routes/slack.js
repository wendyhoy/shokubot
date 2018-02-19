var express = require('express');
var router = express.Router();

// require modules for slackbot
const request = require('request');

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
      // handle errors
    }
  });
}

// Handle add to slack request
// VERB: GET
// PATH: /slack/auth
router.get('/auth', (req, res) => {

  // retrieve Slack verification code from req.query.code
  // send response with verification code, client ID, and client secret
  // via https://slack.com/api/oauth.access
  const options = {
    uri:
      'https://slack.com/api/oauth.access?code='
      +req.query.code
      +'&client_id='+process.env.SLACK_CLIENT_ID
      +'&client_secret='+process.env.SLACK_CLIENT_SECRET,
    method: 'GET'
  };

  request(options, (error, response, body) => {
    const JSONresponse = JSON.parse(body);
    if (!JSONresponse.ok) {

      // respond with error message
      res.send('Authentication Error');

      // NEED TO HANDLE ERROR
    }
    else {

      // respond with success message (redirect to slack?)
      res.send('Add to Slack successful.')

      // NEED TO SAVE RESPONSE to DB
    }
  });

});

// Handle slash commands
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
      'response_type': 'ephemeral'
    };

    // handle command argument
    const arg = reqBody.text.trim();

    switch (arg) {
      case 'set':
        message['text'] = 'Set your reminders.';
        break;
      case 'pause':
        message['text'] = 'Pause your reminders.';
        break;
      case 'resume':
        message['text'] = 'Resume your reminders.';
        break;
      case 'stop':
        message['text'] = 'Stop your reminders.';
        break;
      default:
        message['attachments'] = [
          {
            'fallback': 'Need help with /shokubot? Use \'shokubot set\' to set your reminders. Then use \'shokubot pause\', \'shokubot resume\' and \'shokubot stop\' to pause, resume, and stop your reminders.',
            'pretext': ':wave: Need help with `/shokubot`?',
            'text': '• `/shokubot set` sets your reminders.\n• `/shokubot pause` pauses your reminders.\n• `/shokubot resume` resumes your reminders.\n• `/shokubot stop` stops your reminders.'
          }
        ]
    }

    sendMessageToSlackResponseURL(responseURL, message);
  }

});

module.exports = router;
