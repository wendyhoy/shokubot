const knex = require('../db');

module.exports = {

  create(slackUserId, slackUserName, teamId) {
    return knex('users').insert({
      slack_user_id: slackUserId,
      slack_user_name: slackUserName,
      team_id: teamId
    });
  },

  findBySlackUserId(slackUserId) {
    return knex.select('id')
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
