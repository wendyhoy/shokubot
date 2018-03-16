const knex = require('../db');

module.exports = {

  create (userId, autonomy) {
    return knex('answers').insert({
      user_id: userId,
      autonomy: autonomy
    });
  },

  findAllByTeamId (teamId) {
    return knex.select(
      knex.raw('count(*) as count, count(case when autonomy then 1 end) as autonomy, count(case when complexity then 1 end) as complexity, count(case when reward then 1 end) as reward, date(answers.created_at) as date'))
      .from('answers')
      .innerJoin('users', 'answers.user_id', 'users.id')
      .innerJoin('teams', 'users.team_id', 'teams.id')
      .where('teams.id', teamId)
      .groupBy(knex.raw('date(answers.created_at)'));
  },

  findAllByUserId (userId) {
    return knex.select(
      knex.raw('autonomy, complexity, reward, date(created_at) as date'))
      .from('answers')
      .where('user_id', userId);
  },

  findLastByUserId (userId) {
    return knex.select()
      .from('answers')
      .where('user_id', userId)
      .orderBy('updated_at', 'desc')
      .limit(1);
  },

  updateComplexity (answerId, complexity) {
    return knex('answers')
      .where('id', answerId)
      .update({
        complexity: complexity
      });
  },

  updateReward (answerId, reward) {
    return knex('answers')
      .where('id', answerId)
      .update({
        reward: reward
      });
  }

};
