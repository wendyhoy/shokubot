const { sendToSlackResponseUrl } = require('../helpers/helper_functions');

const Timer = require('./timers_controller');
const Answer = require('../models/answer');
const User = require('../models/user');
const Content = require('../content');

module.exports = {

  async update (req, res) {
    // respond with ok status
    res.status(200).end();

    // set up message
    let message = {
      replace_original: true
    };

    // parse payload
    const jsonPayload = JSON.parse(req.body.payload);
    const slackUserId = jsonPayload.user.id;

    try {
      // find the slack user in the database
      const users = await User.findBySlackUserId(slackUserId);

      const userId = users[0].id;
      const callbackId = jsonPayload.callback_id;
      const answerVal = jsonPayload.actions[0].value === 'yes' ? true : false;

      // save response and send next message
      switch (callbackId) {

        case Content.autonomy.callback_id:

          try {
            await Answer.create(userId, answerVal);
            console.log('Autonomy answer saved to the database.');

            message.text = Content.reminder;
            message.attachments = [
              {
                ...Content.complexity
              }
            ];
          }
          catch(error) {
            console.error(error);
            message.text = Content.error;
          }
          break;

        case Content.complexity.callback_id:

          try {
            const answers = await Answer.findLastAnswerByUserId(userId);
            await Answer.updateComplexity(answers[0].id, answerVal);
            console.log('Complexity answer saved to the database.');

            message.text = Content.reminder;
            message.attachments = [
              {
                ...Content.reward
              }
            ];
          }
          catch(error) {
            console.error(error);
            message.text = Content.error;
          }
          break;

        case Content.reward.callback_id:

          try {
            const answers = await Answer.findLastAnswerByUserId(userId);
            await Answer.updateReward(answers[0].id, answerVal);
            message.text = Content.done;

            const dateStr = await Timer.setNextReminder(slackUserId);
            if (dateStr) {
              message.text += ` ${Content.nextReminder}${dateStr}.`;
            }
            console.log('Reward answer saved to the database. Next reminder set.');
          }
          catch(error) {
            console.error(error);
            message.text = Content.error;
          }
          break;

        default:
          message.text = Content.error;
          break;
      }

      const responseUrl = jsonPayload.response_url;
      sendToSlackResponseUrl(responseUrl, message);
    }
    catch(error) {
      // TODO: handle error
      console.error(error);
    }
  }

}
