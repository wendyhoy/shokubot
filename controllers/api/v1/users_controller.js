const jwt = require('jsonwebtoken');
const ApiController = require('./api_controller');
const User = require('../../../models/user');
const Answer = require('../../../models/answer');

module.exports = {

  async show (req, res) {

    // authenticate user (user must be signed in)
    const authError = await ApiController.authenticateUser(req);
    if (authError !== null) {
      res.json(authError);    
      return;
    }

    // get requested user info
    const id = parseInt(req.params.id);
    const users = await User.findById(id);

    if (users.length <= 0) {
      const notFoundError = {
        json: {
          type: "Not Found",         
        },
        status: 404
      }
      res.json(notFoundError);       
      return;
    }

    // authorize user (user can only request own data)  
    const auth = req.headers.authorization;
    const payload = jwt.verify(auth, process.env.SECRET);
    const { user_id } = payload;

    if (user_id !== id) {
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
      json: {
        user_name: user.slack_real_name,
        team_name: user.slack_team_name,
        answers: runningAvgs
      },
      status: 200
    };

    res.json(jsonResponse);
  }

}
