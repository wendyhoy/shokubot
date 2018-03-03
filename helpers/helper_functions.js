const requestPromise = require('./request_promise');
const timeoutPromise = require('./timeout_promise');
const Team = require('../models/team');
const Content = require('../content');

async function sendToSlackResponseUrl(responseUrl, jsonMessage) {
  const options = {
    uri: responseUrl,
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    json: jsonMessage
  };

  try {
    const response = await requestPromise(options);
    console.log(`sendToSlackResponseUrl: response - ${response}`);
  }
  catch(error) {
    console.error(`sendToSlackResponseUrl: error - ${error}`);
  }
}

async function setNextReminder(slackUserId, reminders) {

  // calculate milliseconds to next reminder
  let today = new Date();
  let dayIndex = today.getDay();
  let daysLeft = 0;

  const todayInSeconds = (today.getHours() * 60 + today.getMinutes()) * 60;
  if (todayInSeconds > reminders.seconds) {
    daysLeft++;
    dayIndex++;
    if (dayIndex > 6) {
      dayIndex = 0;
    }
  }

  while (!reminders.days[dayIndex]) {
    daysLeft++;
    dayIndex++;
    if (dayIndex > 6) {
      dayIndex = 0;
    }
  }

  // set the timer
  const millisecondsLeft = (daysLeft * 24 * 60 * 60 + reminders.seconds - todayInSeconds) * 1000;
  console.log('setNextReminder: millisecondsLeft', millisecondsLeft);

  try {
    // wait for timer to expire
    await timeoutPromise(millisecondsLeft);

    // get token to access user's IM list
    const tokens = await Team.getSlackBotAccessToken(slackUserId);
    const slackBotAccessToken = tokens[0].slack_bot_access_token;

    // get user's IM list
    const optionsImList = {
      uri:
        'https://slack.com/api/im.list?token='
        +slackBotAccessToken,
      method: 'get'
    };

    const response = await requestPromise(optionsImList);
    console.log('setNextReminder: Received IM List.');

    let channelID = null;
    for (let i=0; i<response.ims.length; i++) {
      if (response.ims[i].user === slackUserId) {
        channelID = response.ims[i].id;
        break;
      }
    }

    // post first question to user's IM channel
    const optionsPostMessage = {
      uri: 'https://slack.com/api/chat.postMessage',
      method: 'post',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer '+slackBotAccessToken
      },
      json: {
        channel: channelID,
        attachments: [
          {
            ...Content.autonomy
          }
        ],
        text: Content.reminder
      }
    };

    await requestPromise(optionsPostMessage);
    console.log('setNextReminder: Success.')
  }
  catch(error) {
    console.error(error);
  }

}


module.exports = { sendToSlackResponseUrl, setNextReminder }
