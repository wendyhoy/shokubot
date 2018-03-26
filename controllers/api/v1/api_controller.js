const jwt = require('jsonwebtoken');
const User = require('../../../models/user');

module.exports = {

  async authenticateUser (req) {
    const auth = req.headers.authorization;

    if (!auth || auth === 'null') {
      const noAuth = {
        json: {
          type: "Unauthorized",        
        },
        status: 401
      };
      return noAuth;
    }

    try {
      const payload = jwt.verify(auth, process.env.SECRET);
      const { user_id, access_token } = payload;
      
      const users = await User.findById(user_id);
      if (users.length <= 0 || users[0].slack_access_token !== access_token) {
        const invalidAuth = {
          json: {
            type: "Unauthorized",         
          },
          status: 401
        };
        return invalidAuth;
      }
    }
    catch(error) {
      console.error(error);
      
      const internalError = {
        json: {
          type: "Internal Server Error",        
        },
        status: 500        
      }
      return internalError;
    }

    return null;
  }

}