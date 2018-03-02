const knex = require('../db');

class Answer {

  create(userId, autonomy) {
    return knex('answers').insert({
      user_id: userId,
      autonomy: autonomy
    });
  }

  findLastAnswerByUserId(userId) {
    return knex.select()
      .from('answers')
      .where('user_id', userId)
      .orderBy('updated_at', 'desc')
      .limit(1);
  }

  updateComplexity(answerId, complexity) {
    return knex('answers')
      .where('id', answerId)
      .update({
        complexity: complexity
      });
  }

  updateReward(answerId, reward) {
    return knex('answers')
      .where('id', answerId)
      .update({
        reward: reward
      });
  }

}

module.exports = new Answer();
