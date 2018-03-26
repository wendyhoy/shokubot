const jwt = require('jsonwebtoken');
const User = require('../../../models/user');

module.exports = {

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
