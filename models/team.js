const knex = require('../db');

module.exports = {

  create(slackTeamName, slackTeamId, botUserId, botAccessToken) {
    return knex('teams').insert({
      slack_team_name: slackTeamName,
      slack_team_id: slackTeamId,
      slack_bot_user_id: botUserId,
      slack_bot_access_token: botAccessToken
    });
  },

  findBySlackTeamId(slackTeamId) {
    return knex.select('id')
      .from('teams')
      .where('slack_team_id', slackTeamId);
  },

  getSlackBotAccessToken(slackUserId) {
    return knex.select('slack_bot_access_token')
      .from('teams')
      .innerJoin('users', 'teams.id', 'users.team_id')
      .where('slack_user_id', slackUserId);
  }

}
