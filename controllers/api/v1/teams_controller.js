const {
  sendToSlackOauth,
  sendToSlackImChannel,
  getSlackImChannel,
  openSlackImChannel
} = require('../../../helpers/helper_functions');

const jwt = require('jsonwebtoken');
const ApiController = require('./api_controller');
const Team = require('../../../models/team');
const User = require('../../../models/user');
const Answer = require('../../../models/answer');
const Content = require('../../../content');

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

    let dailyCount = 0;
    let totalCount = 0;
    let autonomyTotal = 0;
    let complexityTotal = 0;
    let rewardTotal = 0;

    const runningAvgs = answers.map(answer => {

      dailyCount = parseInt(answer.count);
      totalCount += dailyCount;
      autonomyTotal += parseInt(answer.autonomy);
      complexityTotal += parseInt(answer.complexity);
      rewardTotal += parseInt(answer.reward);

      return {
        autonomy: Math.trunc(autonomyTotal / totalCount * 100),
        complexity: Math.trunc(complexityTotal / totalCount * 100),
        reward: Math.trunc(rewardTotal / totalCount * 100),
        date: answer.date,
        daily_count: dailyCount,
        total_count: totalCount
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
  },

  async new (req, res) {

    // Slack verification code is stored in req.query.code
    // Send request back with verification code, client ID, and client secret
    // via https://slack.com/api/oauth.access
    // and wait for JSON response from Slack
    try {
      const verificationCode = req.query.code;
      const redirectUrl = `${process.env.DOMAIN}/api/v1/teams/new`; 

      const response = await sendToSlackOauth(verificationCode, redirectUrl);
      console.log('Shokubot added successfully');

      const { team_name, team_id, user_id, bot } = response;
      const { bot_user_id, bot_access_token } = bot;

      try {
        await Team.create(
          team_name,
          team_id,
          bot_user_id,
          bot_access_token
        );
      }
      catch(error) {
        // Slack team already exists
        console.error(error);
      }
      finally {
        // Slack team was added successfully
        console.log('Slack team added successfully.');

        // Get this user's DM channel ID
        let channelId = await getSlackImChannel(bot_access_token, user_id);

        // PATCH:
        // If no channelId, open IM channel Id
        if (!channelId) {
          const response = await openSlackImChannel(bot_access_token, user_id);
          console.log('openSlackImChannel response');
          console.log(response);
          channelId = response.channel.id;
        }

        // DM the user with onboarding information
        const message = {
          channel: channelId,
          text: Content.welcome
        };

        await sendToSlackImChannel(bot_access_token, message);

        res.redirect(`${process.env.CLIENT}`);
      }
    }
    catch(error) {
      console.error(error);
      res.send('add_to_slack_error');
    }
  } 

}
