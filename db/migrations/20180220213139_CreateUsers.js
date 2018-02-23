
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', table => {
    table.increments();
    table.string('slack_user_id').unique();
    table.string('slack_user_name');
    table.integer('slack_team_id').unsigned();
    table.timestamps(false, true);

    table.foreign('slack_team_id').references('id').inTable('teams');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
