const knex = require('../db');

module.exports = {

  create (slackTeamName, slackTeamId, botUserId, botAccessToken) {
    return knex('teams').insert({
      slack_team_name: slackTeamName,
      slack_team_id: slackTeamId,
      slack_bot_user_id: botUserId,
      slack_bot_access_token: botAccessToken
    });
  },

  all () {
    return knex.select('slack_team_name')
      .from('teams');
  },

  findById (teamId) {
    return knex.select('slack_team_name')
      .from('teams')
      .where('id', teamId);
  },

  findBySlackTeamId (slackTeamId) {
    return knex.select('id', 'slack_bot_access_token')
      .from('teams')
      .where('slack_team_id', slackTeamId);
  },

  getSlackBotAccessToken (slackUserId) {
    return knex.select('slack_bot_access_token')
      .from('teams')
      .innerJoin('users', 'teams.id', 'users.team_id')
      .where('slack_user_id', slackUserId);
  }

}
