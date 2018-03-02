const knex = require('../db');

class Team {

  create(teamName, teamId, botUserId, botAccessToken) {
    return knex('teams').insert({
      slack_team_name: teamName,
      slack_team_id: teamId,
      slack_bot_user_id: botUserId,
      slack_bot_access_token: botAccessToken
    });
  }

}

module.exports = new Team();
