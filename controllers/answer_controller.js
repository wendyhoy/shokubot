const answer = require('../models/answer');
const user = require('../models/user');
const content = require('../content');
const { sendToSlackResponseUrl } = require('../helpers/helper_functions');

class AnswerController {

  update (req, res) {
    // respond with ok status
    res.status(200).end();

    // set up message
    let message = {
      replace_original: true
    };

    // parse payload
    const jsonPayload = JSON.parse(req.body.payload);
    const slackUserId = jsonPayload.user.id;

    // find the slack user in the database
    user.findBySlackUserId(slackUserId)
      .then(users => {

        const userId = users[0].id;
        const callbackId = jsonPayload.callback_id;
        const answerVal = jsonPayload.actions[0].value === 'yes' ? true : false;

        // save response and send next message
        switch (callbackId) {

          case content.autonomy.callback_id:

            answer.create(userId, answerVal)
              .then(() => {
                console.log('Autonomy answer saved to the database.');
              })
              .catch(error => {
                // TODO: handle error
                console.error(error);
              });

            message.attachments = [
              {
                ...content.complexity
              }
            ];
            break;

          case content.complexity.callback_id:

            answer.findLastAnswerByUserId(userId)
              .then(answers => {
                return answer.updateComplexity(answers[0].id, answerVal);
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
                ...content.reward
              }
            ];
            break;

          case content.reward.callback_id:

            answer.findLastAnswerByUserId(userId)
              .then(answers => {
                return answer.updateReward(answers[0].id, answerVal);
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
                  ...content.done
                }
              ];
            break;

          default:
            message.text = 'Sorry, something went wrong.';
            break;
        }

        const responseUrl = jsonPayload.response_url;
        sendToSlackResponseUrl(responseUrl, message);
      })
      .catch(error => {
        // TODO: handle error
        console.error(error);
      });
  }

}

module.exports = new AnswerController();
