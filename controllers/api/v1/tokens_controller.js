const jwt = require('jsonwebtoken');

const User = require('../../../models/user');

module.exports = {

  async create (req, res) {

    const reqToken = req.body.code;
    const payload = jwt.verify(reqToken, process.env.SECRET);
    const { slack_user_id } = payload;
    
    try {
      const users = await User.getSlackAccessToken(slack_user_id);
      const userId = users[0].id;
      const slackAccessToken = users[0].slack_access_token;

      const resToken = jwt.sign(
        { 
          user_id: userId,
          access_token: slackAccessToken
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
