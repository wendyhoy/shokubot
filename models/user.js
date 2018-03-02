const knex = require('../db');

class User {

  create(slackUserId, slackUserName, teamId) {
    return knex('users').insert({
      slack_user_id: slackUserId,
      slack_user_name: slackUserName,
      team_id: teamId
    });
  }

  saveReminders(slackUserId, reminders) {
    return knex('users')
      .where('slack_user_id', slackUserId)
      .update({
        reminders: JSON.stringify(reminders)
      });
  }

}

module.exports = new User();
