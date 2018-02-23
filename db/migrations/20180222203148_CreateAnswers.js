
exports.up = function(knex, Promise) {
  return knex.schema.createTable('answers', table => {
    table.increments();
    table.integer('user_id').unsigned();
    table.boolean('autonomy');
    table.boolean('complexity');
    table.boolean('reward');
    table.timestamps(false, true);

    table.foreign('user_id').references('id').inTable('users');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('answers');
};
