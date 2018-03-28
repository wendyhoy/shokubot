const requestPromise = require('./request_promise');

async function sendToSlackOauth(verificationCode, redirectUrl) {
  const options = {
    uri:
      'https://slack.com/api/oauth.access?code='
      +verificationCode
      +'&client_id='+process.env.SLACK_CLIENT_ID
      +'&client_secret='+process.env.SLACK_CLIENT_SECRET
      +'&redirect_uri='+redirectUrl,
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
  console.log(`sendToSlackImChannel: message: ${jsonMessage}`);
  console.log(jsonMessage);
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
    console.log(response);
  }
  catch(error) {
    console.error(`sendToSlackImChannel: error - ${error}`);
  }
}

async function getSlackImChannel(accessToken, slackUserId) {
  console.log(`getSlackImChannel: slackUserId: ${slackUserId}`);

  try {

    let channelID = null;
    let nextCursor = ""; 

    do { 

      const options = {
        uri:
          `https://slack.com/api/im.list?limit=100&token=${accessToken}`
          +(nextCursor !== "" ? `&cursor=${nextCursor}` : ""),
        method: 'get'
      };      

      const response = await requestPromise(options);
      nextCursor = response.response_metadata.next_cursor;
      console.log(`getSlackImChannel: received response, next cursor: ${nextCursor}`);
      console.log(options);
      console.log(response);

      for (let i=0; i<response.ims.length; i++) {
        if (response.ims[i].user === slackUserId) {
          channelID = response.ims[i].id;
          console.log('getSlackImChannel: found channel: ', channelID);
          break;
        }
      }
      
    } while (channelID === null && nextCursor !== "");

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

async function openSlackImChannel(accessToken, slackUserId) {

  const options = {
    uri: 'https://slack.com/api/im.open',
    method: 'post',
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer '+accessToken
    },
    json: {
      'user': slackUserId
    }
  };

  try {
    const response = await requestPromise(options);
    console.log(`openSlackImChannel: response - ${response}`);
    return response;
  }
  catch(error) {
    console.error(`openSlackImChannel: error - ${error}`);
    return error;
  }
}

module.exports = {
  sendToSlackOauth,
  sendToSlackResponseUrl,
  sendToSlackImChannel,
  getSlackImChannel,
  getSlackUserInfo,
  openSlackImChannel
}
