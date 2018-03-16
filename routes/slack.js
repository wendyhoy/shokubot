const express = require('express');
const bodyParser = require('body-parser');

const TeamsController = require('../controllers/teams_controller');
const UsersController = require('../controllers/users_controller');
const AnswersController = require('../controllers/answers_controller');

const router = express.Router();
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

// Handle add to slack request
// VERB: GET
// PATH: /slack/teams
router.get('/teams', TeamsController.create);

// Handle sign in with slack
// VERB: GET
// PATH: /slack/users
router.get('/users', UsersController.create);

// Handle slash commands
// VERB: POST
// PATH: /slack/users
router.post('/users', UsersController.update);

// Handles button clicks from interactive messages
// VERB: POST
// PATH: /slack/answers
router.post('/answers', urlEncodedParser, AnswersController.update);


module.exports = router;
