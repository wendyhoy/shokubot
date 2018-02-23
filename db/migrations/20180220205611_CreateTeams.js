
exports.up = function(knex, Promise) {
  return knex.schema.createTable('teams', table => {
    table.increments();
    table.string('slack_team_id').unique();
    table.string('slack_team_name');
    table.string('slack_bot_user_id');
    table.string('slack_bot_access_token');
    table.timestamps(false, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('teams');
};
