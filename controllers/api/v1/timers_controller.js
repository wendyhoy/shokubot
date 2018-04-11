const { 
  sendToSlackImChannel, 
  openSlackImChannel 
} = require('../../../helpers/helper_functions');

const moment = require('moment');
const Team = require('../../../models/team');
const User = require('../../../models/user');
const Answer = require('../../../models/answer');
const Content = require('../../../content');

const timers = {};

module.exports = {

  // helper function to determine if the user has already
  // answered their questions for today
  // used to set the next reminder and check if they can use the 'now' command
  async isDoneToday(slackUserId) {

    try {
      // get most recent answer for this user
      const users = await User.findBySlackUserId(slackUserId);
      const userId = users[0].id;
      const answers = await Answer.findLastByUserId(userId);
      console.log('isDoneToday: answers length', answers, answers.length);

      // if no answers, return false
      if(answers.length <= 0) {
        console.log('isDoneToday: false');
        return false;
      }

      // otherwise, check the date of the most recent answer
      const answerUpdatedAt = answers[0].updated_at;

      // convert client timezone offset to milliseconds
      const tzOffsets = await User.getSlackTimezoneOffset(slackUserId);
      const clientTimezoneOffset = tzOffsets[0].slack_tz_offset * 1000;

      // compare the client's current time with their last answer time
      const clientDate = new Date(Date.now() + clientTimezoneOffset);
      const serverAnswerDate = Date.parse(answerUpdatedAt);
      const clientAnswerDate = new Date(serverAnswerDate + clientTimezoneOffset);

      // if less than 1 day has passed and the date is the same, then they've
      // already answered their questions for today
      const diffInMS = clientDate - clientAnswerDate;
      const millisecondsPerDay = 1000 * 60 * 60 * 24;

      if ((diffInMS < millisecondsPerDay) &&
          (clientDate.getUTCDate() === clientAnswerDate.getUTCDate())) {
        return true;
      }
      else {
        return false;
      }
    }
    catch(error) {
      return error;
    }
  },

  // helper function to convert reminders between UTC and client's time
  // used when setting reminders, converting reminders to a formatted string,
  // and calculating the next reminder
  applyTimezone(reminders, tzOffset) {

    reminders.seconds += tzOffset;

    // if seconds is greater than one day, i.e., rollover
    const secondsPerDay = 24 * 60 * 60;
    if (reminders.seconds > secondsPerDay) {
      reminders.seconds -= secondsPerDay;
      const saturday = reminders.days.pop();
      reminders.days.unshift(saturday);
    }
    else if (reminders.seconds < 0) {
      reminders.seconds += secondsPerDay;
      const sunday = reminders.days.shift();
      reminders.days.push(sunday);
    }

    return reminders;
  },

  // returns true if there's an active timer for the user
  hasReminder(slackUserId) {
    return timers[slackUserId] !== undefined;
  },

  // cancels existing reminders/timers for this user
  // used when users pause their reminders or sets new reminders
  cancelReminders(slackUserId) {

    const timeout = timers[slackUserId];
    if (timeout) {
      clearTimeout(timeout);
      delete timers[slackUserId];
    }
  },

  // sets the next reminder/timer for this user
  // used when the user completes a set of questions, sets new reminders,
  // or unpauses their reminders
  async setNextReminder(slackUserId) {

    // private callback to send the reminder when timer expires
    async function sendReminder(slackUserId) {

      try {
        console.log('sendReminder: start');

        // get token to send the reminder
        const tokens = await Team.getSlackBotAccessToken(slackUserId);
        const slackBotAccessToken = tokens[0].slack_bot_access_token;

        // get user's IM channel
        const channelIds = await User.getSlackImChannelId(slackUserId);
        let channelId = channelIds[0].slack_im_channel_id;

        // PATCH: open IM channel if channelId doesn't exist in table
        if (!channelId) {
          const response = await openSlackImChannel(slackBotAccessToken, slackUserId);
          console.log('sendReminder: openSlackImChannel response');
          console.log(response);
          channelId = response.channel.id;
        }

        // post first question to user's IM channel
        const message = {
          channel: channelId,
          attachments: [
            {
              ...Content.autonomy
            }
          ],
          text: Content.reminder
        };

        // clear our timer and send the message
        delete timers[slackUserId];
        await sendToSlackImChannel(slackBotAccessToken, message);
        console.log('sendReminder: success');
      }
      catch(error) {
        console.error(error);
      }
    }

    //
    // setNextReminder
    //
    try {

      // check if reminders exist
      let reminders = await User.getReminders(slackUserId);
      reminders = reminders[0].reminders;
      console.log('setNextReminder: reminders utc', reminders);

      if (!reminders) {
        return null;
      }

      // get client's timezone offset in seconds and milliseconds
      const tzOffsets = await User.getSlackTimezoneOffset(slackUserId);
      const tzOffsetSec = tzOffsets[0].slack_tz_offset;
      const tzOffsetMS = tzOffsetSec * 1000;

      // convert reminders to the client's time (reminders are in seconds)
      reminders = this.applyTimezone(reminders, tzOffsetSec);
      console.log('setNextReminder: reminders client time', reminders);

      // calculate today (in MS) in client's time
      const today = new Date(Date.now() + tzOffsetMS);
      let dayIndex = today.getUTCDay();
      let daysLeft = 0;

      const hours = today.getUTCHours();
      const minutes = today.getUTCMinutes();
      const seconds = today.getUTCSeconds();

      const todayInSeconds = (hours * 60 + minutes) * 60 + seconds;
      console.log('setNextReminder: todayInSeconds', todayInSeconds);

      // helper to increment which day can be the earliest reminder
      // and the number of days left to the next reminder
      const incrementDay = () => {
        daysLeft++;
        dayIndex++;
        if (dayIndex > 6) {
          dayIndex = 0;
        }
      };

      // if the user has already answered the question for today OR
      // if we're already passed the reminder time for today, go to the next day
      const isDoneToday = await this.isDoneToday(slackUserId);
      if (isDoneToday || (todayInSeconds >= reminders.seconds)) {
        console.log('setNextReminder: passed the reminder time today or already done.');
        incrementDay();
      }

      // check for the next reminder
      while (!reminders.days[dayIndex]) {
        incrementDay();
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
      const year = today.getUTCFullYear();
      const month = today.getUTCMonth();
      const date = today.getUTCDate();
      console.log('setNextReminder: now y m d h m s', year, month, date, hours, minutes, seconds);

      // get day of next reminder in seconds
      const todayMS = Date.UTC(year, month, date, hours, minutes, seconds);
      const nextReminderMS = todayMS + millisecondsLeft;

      // convert to date object and return string
      // need to 'un-add' the server's timezone offset in milliseconds
      // to retain client's time
      const serverTzOffsetMS = today.getTimezoneOffset() * 60000;
      const localDate = new Date(nextReminderMS + serverTzOffsetMS);
      const dateStr = moment(localDate).format('dddd MMMM Do, h:mm a');
      return dateStr;
    }
    catch(error) {
      return error;
    }
  }

}
