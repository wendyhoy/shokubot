const requestPromise = require('../helpers/request_promise');
const Team = require('../models/team')

module.exports = {

  async create (req, res) {

    // Slack verification code is stored in req.query.code
    // Send request back with verification code, client ID, and client secret
    // via https://slack.com/api/oauth.access
    const options = {
      uri:
        'https://slack.com/api/oauth.access?code='
        +req.query.code
        +'&client_id='+process.env.SLACK_CLIENT_ID
        +'&client_secret='+process.env.SLACK_CLIENT_SECRET,
      method: 'get'
    };

    // send request back and wait for JSON response from Slack
    try {
      const response = await requestPromise(options);
      await Team.create(
        response.team_name,
        response.team_id,
        response.bot.bot_user_id,
        response.bot.bot_access_token
      );

      console.log('Slack team added successfully.');
      res.send('Add to Slack successful.')
    }
    catch(error) {
      console.error(error);
      res.send(error);
    }

  }

}
