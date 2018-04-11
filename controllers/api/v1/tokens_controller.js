const { sendToSlackOauth } = require('../../../helpers/helper_functions');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user');

module.exports = {

  async new (req, res) {
    console.log('Sign in with Slack requested.');

    // Slack verification code is stored in req.query.code
    // Send request back with verification code, client ID, and client secret
    // via https://slack.com/api/oauth.access
    // and wait for JSON response from Slack
    try {
      const verificationCode = req.query.code;
      const redirectUrl = `${process.env.DOMAIN}/api/v1/tokens/new`;

      const response = await sendToSlackOauth(verificationCode, redirectUrl);
      console.log('Sign in with Slack successful');

      // Slack user signed in successfully
      // Save access token
      const { access_token, user } = response;
      const { id: userId } = user;

      // Assume the team has already added shokubot
      // Assume the user has used shokubot and is in the database
      // TODO: Need to support case where team is not added yet
      // TODO: Need to support adding new users

      // Update the user
      await User.update(userId, {
        slack_access_token: access_token,
      });

      // create jwt token with slack user id
      const token = jwt.sign(
        { slack_user_id: userId },
        process.env.SECRET
      );

      res.redirect(`${process.env.CLIENT}/signing_in?id=${token}`);
    }
    catch(error) {
      console.error(error);
      res.send('sign_in_with_slack_error');
    }
  },

  async create (req, res) {

    const reqToken = req.body.code;

    try {
      const payload = jwt.verify(reqToken, process.env.SECRET);
      const { slack_user_id } = payload;
    
      const users = await User.findBySlackUserId(slack_user_id);
      const user = users[0];

      const resToken = jwt.sign(
        { 
          user_id: user.id,
          user_name: user.slack_real_name,
          team_id: user.team_id,
          access_token: user.slack_access_token
        },
        process.env.SECRET
      );

      const jsonResponse = {
        jwt: resToken
      };

      res.json(jsonResponse);
    }
    catch(error) {
      console.error(error);
    }
  }

}
