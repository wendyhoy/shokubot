const requestPromise = require('./request_promise');

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

async function sendToSlackImChannel(accessToken, jsonMessage) {
  const options = {
    uri: 'https://slack.com/api/chat.postMessage',
    method: 'post',
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer '+accessToken
    },
    json: jsonMessage
  };

  try {
    const response = await requestPromise(options);
    console.log(`sendToSlackImChannel: response - ${response}`);
  }
  catch(error) {
    console.error(`sendToSlackImChannel: error - ${error}`);
  }
}

async function getSlackImChannel(accessToken, slackUserId) {
  const options = {
    uri:
      'https://slack.com/api/im.list?token='
      +accessToken,
    method: 'get'
  };

  try {
    const response = await requestPromise(options);

    let channelID = null;
    for (let i=0; i<response.ims.length; i++) {
      if (response.ims[i].user === slackUserId) {
        channelID = response.ims[i].id;
        break;
      }
    }

    return channelID;
  }
  catch(error) {
    return error;
  }
}

async function getSlackUserInfo(slackBotAccessToken, slackUserId) {
  const options = {
    uri:
      'https://slack.com/api/users.info?token='
      +slackBotAccessToken
      +'&user='+slackUserId,
    method: 'get'
  };

  try {
    const response = await requestPromise(options);
    return response;
  }
  catch(error) {
    return error;
  }
}


module.exports = {
  sendToSlackResponseUrl,
  sendToSlackImChannel,
  getSlackImChannel,
  getSlackUserInfo
}
