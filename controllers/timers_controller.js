const requestPromise = require('../helpers/request_promise');
const { sendToSlackImChannel } = require('../helpers/helper_functions');

const Team = require('../models/team');
const User = require('../models/user');
const Content = require('../content');

const timers = {};

module.exports = {

  cancelReminders(slackUserId) {

    // clear current timer
    const timeout = timers[slackUserId];
    if (timeout) {
      clearTimeout(timeout);
      delete timers[slackUserId];
    }
  },

  async setNextReminder(slackUserId) {

    // private callback to send the reminder when timer expires
    async function sendReminder(slackUserId) {

      try {
        console.log('sendReminder');

        // get token to access user's IM list
        const tokens = await Team.getSlackBotAccessToken(slackUserId);
        const slackBotAccessToken = tokens[0].slack_bot_access_token;

        // get user's IM list
        const channelIds = await User.getSlackImChannelId(slackUserId);

        // post first question to user's IM channel
        const message = {
          channel: channelIds[0].slack_im_channel_id,
          attachments: [
            {
              ...Content.autonomy
            }
          ],
          text: Content.reminder
        };

        delete timers[slackUserId];
        await sendToSlackImChannel(slackBotAccessToken, message);
        console.log('sendReminder: Success.');
      }
      catch(error) {
        console.error(error);
      }

    }


    try {
      // calculate milliseconds to next reminder
      let today = new Date();
      let dayIndex = today.getDay();
      let daysLeft = 0;

      let reminders = await User.getReminders(slackUserId);
      reminders = reminders[0].reminders;
      console.log('setNextReminder: reminders', reminders);

      const todayInSeconds = (today.getHours() * 60 + today.getMinutes()) * 60;
      if (todayInSeconds >= reminders.seconds) {
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

      // cancel previous reminders
      this.cancelReminders(slackUserId);

      // set new reminder and save timeout object
      const timeout = setTimeout(sendReminder, millisecondsLeft, slackUserId);
      timers[slackUserId] = timeout;
    }
    catch(error) {
      console.error(error);
    }

  }

}
