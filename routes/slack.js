const express = require('express');
const bodyParser = require('body-parser');

const TeamController = require('../controllers/team_controller');
const UserController = require('../controllers/user_controller');
const AnswerController = require('../controllers/answer_controller');

const router = express.Router();
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

// Handle add to slack request
// VERB: GET
// PATH: /slack/teams
router.get('/teams', TeamController.create);

// Handle slash commands
// VERB: POST
// PATH: /slack/users
router.post('/users', UserController.update);

// Handles button clicks from interactive messages
// VERB: POST
// PATH: /slack/answers
router.post('/answers', urlEncodedParser, AnswerController.update);


module.exports = router;
