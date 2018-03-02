const request = require('request');

function requestPromise(options) {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      const JSONresponse = JSON.parse(body);
      if (JSONresponse.ok) {
        resolve(JSONresponse);
      }
      else {
        reject(JSONresponse.error);
      }
    });
  });
}

module.exports = requestPromise
