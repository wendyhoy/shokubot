const requestPromise = require('../helpers/request_promise');
const { sendToSlackImChannel, getSlackImChannel } = require('../helpers/helper_functions');

const Team = require('../models/team');
const Content = require('../content');

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
      console.log('Shokubot added successfully: ', response);

      const { team_name, team_id, user_id, bot } = response;
      const { bot_user_id, bot_access_token } = bot;

      await Team.create(
        team_name,
        team_id,
        bot_user_id,
        bot_access_token
      );

      // Slack team was added successfully
      console.log('Slack team added successfully.');

      // Get this user's DM channel ID
      const channelId = await getSlackImChannel(bot_access_token, user_id);

      // DM the user with onboarding information
      const message = {
        channel: channelId,
        text: Content.welcome
      };

      await sendToSlackImChannel(bot_access_token, message);

      res.send('Add to Slack successful.')
    }
    catch(error) {
      console.error(error);
      res.send(error);
    }

  }

}
