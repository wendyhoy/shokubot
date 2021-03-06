const knex = require('../db');

module.exports = {

  create (slackUserId, teamId) {
    return knex('users').insert({
      slack_user_id: slackUserId,
      team_id: teamId
    });
  },

  update (slackUserId, params) {
    return knex('users')
      .where('slack_user_id', slackUserId)
      .update(params);
  },

  all () {
    return knex.select('slack_user_id')
      .from('users')
      .whereNotNull('reminders')
      .where('paused', false);
  },

  findById (userId) {
    return knex.select('slack_real_name', 'slack_team_name', 'slack_access_token', 'team_id')
      .from('users')
      .innerJoin('teams', 'users.team_id', 'teams.id')
      .where('users.id', userId);
  },

  findBySlackUserId (slackUserId) {
    return knex.select('id', 'slack_real_name', 'slack_access_token', 'team_id')
      .from('users')
      .where('slack_user_id', slackUserId);
  },

  getSlackImChannelId (slackUserId) {
    return knex.select('slack_im_channel_id')
      .from('users')
      .where('slack_user_id', slackUserId);
  },

  getSlackTimezoneOffset (slackUserId) {
    return knex.select('slack_tz_offset')
      .from('users')
      .where('slack_user_id', slackUserId);
  },

  setReminders (slackUserId, reminders) {
    return knex('users')
      .where('slack_user_id', slackUserId)
      .update({
        reminders: JSON.stringify(reminders)
      });
  },

  getReminders (slackUserId) {
    return knex.select('reminders')
      .from('users')
      .where('slack_user_id', slackUserId);
  },

  setPaused (slackUserId, value) {
    return knex('users')
      .where('slack_user_id', slackUserId)
      .update({
        paused: value
      });
  },

  isPaused (slackUserId) {
    return knex.select('paused')
      .from('users')
      .where('slack_user_id', slackUserId);
  }

}
