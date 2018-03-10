const knex = require('../db');

module.exports = {

  create(slackUserId, slackImChannelId, teamId) {
    return knex('users').insert({
      slack_user_id: slackUserId,
      slack_im_channel_id: slackImChannelId,
      team_id: teamId
    });
  },

  update(slackUserId, realName, tzOffset) {
    return knex('users')
      .where('slack_user_id', slackUserId)
      .update({
        slack_real_name: realName,
        slack_tz_offset: tzOffset
      });
  },

  findBySlackUserId(slackUserId) {
    return knex.select('id')
      .from('users')
      .where('slack_user_id', slackUserId);
  },

  getSlackImChannelId(slackUserId) {
    return knex.select('slack_im_channel_id')
      .from('users')
      .where('slack_user_id', slackUserId);
  },

  getSlackTimezoneOffset(slackUserId) {
    return knex.select('slack_tz_offset')
      .from('users')
      .where('slack_user_id', slackUserId);
  },

  setReminders(slackUserId, reminders) {
    return knex('users')
      .where('slack_user_id', slackUserId)
      .update({
        reminders: JSON.stringify(reminders)
      });
  },

  getReminders(slackUserId) {
    return knex.select('reminders')
      .from('users')
      .where('slack_user_id', slackUserId);
  }

}
