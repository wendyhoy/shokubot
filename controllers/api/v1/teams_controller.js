const jwt = require('jsonwebtoken');
const ApiController = require('./api_controller');
const Team = require('../../../models/team');
const User = require('../../../models/user');
const Answer = require('../../../models/answer');

module.exports = {

  async index (req, res) {
    const teams = await Team.all();
    const jsonResponse = {
      json: {
        team_names: teams
      },
      status: 200
    }
    res.json(jsonResponse);
  },

  async show (req, res) {

    // authenticate user (user must be signed in)
    const authError = await ApiController.authenticateUser(req);
    if (authError !== null) {
      res.json(authError);    
      return;
    }

    // get requested team info
    const id = parseInt(req.params.id);
    const teams = await Team.findById(id);

    if (teams.length <= 0) {
      const notFoundError = {
        json: {
          type: "Not Found",         
        },
        status: 404
      }
      res.json(notFoundError);       
      return;      
    }

    // authorize user (user can only request their team's data)  
    const auth = req.headers.authorization;
    const payload = jwt.verify(auth, process.env.SECRET);
    const { team_id } = payload;

    if (team_id !== id) {
      const notAuthorized = {
        json: {
          type: "Unauthorized",         
        },
        status: 401
      }
      res.json(notAuthorized);     
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
      json: {
        team_name: team.slack_team_name,
        answers: runningAvgs
      },
      status: 200
    };

    res.json(jsonResponse);
  }

}
