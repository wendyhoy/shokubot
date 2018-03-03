const express = require('express');
const bodyParser = require('body-parser');

const TeamController = require('../controllers/team_controller');
const UserController = require('../controllers/user_controller');
const AnswerController = require('../controllers/answer_controller');

const router = express.Router();
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

// Handle add to slack request
// VERB: GET
// PATH: /slack/team
router.get('/team', TeamController.create);

// Handle slash commands
// VERB: POST
// PATH: /slack/user
router.post('/user', UserController.update);

// Handles button clicks from interactive messages
// VERB: POST
// PATH: /slack/answer
router.post('/answer', urlEncodedParser, AnswerController.update);


module.exports = router;
