const {
  sendToSlackOauth,
  sendToSlackImChannel,
  getSlackImChannel
} = require('../helpers/helper_functions');

const Team = require('../models/team');
const Content = require('../content');

module.exports = {

  async create (req, res) {

    // Slack verification code is stored in req.query.code
    // Send request back with verification code, client ID, and client secret
    // via https://slack.com/api/oauth.access
    // and wait for JSON response from Slack
    try {
      const verificationCode = req.query.code;
      const redirectUrl = `${process.env.DOMAIN}/slack/teams`;

      const response = await sendToSlackOauth(verificationCode, redirectUrl);
      console.log('Shokubot added successfully');

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

      res.redirect(`${process.env.CLIENT}`);
    }
    catch(error) {
      console.error(error);
      res.send('add_to_slack_error');
    }

  }

}
