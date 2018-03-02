const request = require('request');

function requestPromise(options) {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      }
      else {
        try {
          const jsonResponse = JSON.parse(body);
          resolve(jsonResponse);
        }
        catch(jsonError) {
          console.log(jsonError);
          resolve(body);
        }
      }
    });
  });
}

module.exports = requestPromise
