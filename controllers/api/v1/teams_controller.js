const Team = require('../../../models/team');
const Answer = require('../../../models/answer');

module.exports = {

  async index (req, res) {
    const teams = await Team.all();
    res.json(teams);
  },

  async show (req, res, next) {

    const { id } = req.params;

    // get team info
    const teams = await Team.findById(id);
    if (teams.length <= 0) {
       next();
       return;
    }

    // get answers
    const answers = await Answer.findAllByTeamId(id);

    let count = 0;
    let autonomyTotal = 0;
    let complexityTotal = 0;
    let rewardTotal = 0;

    const runningAvgs = answers.map(answer => {

      count += answer.count;
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

    const team = teams[0];
    const jsonResponse = {
      team_name: team.slack_team_name,
      answers: runningAvgs
    };

    res.json(jsonResponse);
  }

}
