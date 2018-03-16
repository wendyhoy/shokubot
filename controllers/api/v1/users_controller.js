const User = require('../../../models/user');
const Answer = require('../../../models/answer');

module.exports = {

  async show (req, res, next) {

    const { id } = req.params;

    // get user info
    const users = await User.findById(id);
    if (users.length <= 0) {
       next();
       return;
    }

    // get answers
    const answers = await Answer.findAllByUserId(id);

    let count = 0;
    let autonomyTotal = 0;
    let complexityTotal = 0;
    let rewardTotal = 0;

    const runningAvgs = answers.map(answer => {

      count += 1;
      autonomyTotal += answer.autonomy;
      complexityTotal += answer.complexity;
      rewardTotal += answer.reward;

      return {
        autonomy: Math.trunc(autonomyTotal / count * 100),
        complexity: Math.trunc(complexityTotal / count * 100),
        reward: Math.trunc(rewardTotal / count * 100),
        date: answer.date
      };

    });

    const user = users[0];
    const jsonResponse = {
      user_name: user.slack_real_name,
      team_name: user.slack_team_name,
      answers: runningAvgs
    };

    res.json(jsonResponse);
  }

}
