const moment = require('moment');
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

        // get token to send the reminder
        const tokens = await Team.getSlackBotAccessToken(slackUserId);
        const slackBotAccessToken = tokens[0].slack_bot_access_token;

        // get user's IM channel
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
      const today = new Date();
      let dayIndex = today.getUTCDay();
      let daysLeft = 0;

      let reminders = await User.getReminders(slackUserId);
      reminders = reminders[0].reminders;
      console.log('setNextReminder: reminders', reminders);

      const utcHours = today.getUTCHours();
      const utcMinutes = today.getUTCMinutes();
      const utcSeconds = today.getUTCSeconds();

      const todayInSeconds = (utcHours * 60 + utcMinutes) * 60 + utcSeconds;

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

      // return the date of the next reminder
      // construct today's date in UTC
      const utcYear = today.getUTCFullYear();
      const utcMonth = today.getUTCMonth();
      const utcDate = today.getUTCDate();

      // get UTC day of next reminder in seconds
      const utcToday = Date.UTC(utcYear, utcMonth, utcDate, utcHours, utcMinutes, utcSeconds);
      const utcNextReminder = utcToday + millisecondsLeft;

      // convert to slack user's timezone
      // server's timezone offset is in minutes; positive if behind UTC, negative if ahead
      const serverTimezoneOffset = today.getTimezoneOffset() * 60000;
      let clientTimezoneOffset = await User.getSlackTimezoneOffset(slackUserId);
      clientTimezoneOffset = clientTimezoneOffset[0].slack_tz_offset * 1000;

      const localNextReminder = utcNextReminder + clientTimezoneOffset + serverTimezoneOffset;
      const localDate = new Date(localNextReminder);

      const dateStr = moment(localDate).format('dddd MMMM Do, h:mm a');
      return dateStr;
    }
    catch(error) {
      return error;
    }

  }

}
