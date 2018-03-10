
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', table => {
    table.increments();
    table.string('slack_user_id').unique();
    table.string('slack_real_name');
    table.string('slack_im_channel_id');
    table.integer('slack_tz_offset');
    table.integer('team_id').unsigned();
    table.json('reminders');
    table.timestamps(false, true);

    table.foreign('team_id').references('id').inTable('teams');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
