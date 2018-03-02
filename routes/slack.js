const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const knex = require('../db');

const teamController = require('../controllers/team_controller');
const userController = require('../controllers/user_controller');
const answerController = require('../controllers/answer_controller');
const { sendToSlackResponseUrl } = require('../helpers/helper_functions');
const content = require('../content.js');

const router = express.Router();
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

// Handle add to slack request
// VERB: GET
// PATH: /slack/team/create
router.get('/team/create', teamController.create);

// Handle slash commands
// VERB: POST
// PATH: /slack/user/update
router.post('/user/update', userController.update);

// Handles button clicks from interactive messages
// VERB: POST
// PATH: /slack/answer/update
router.post('/answer/update', urlEncodedParser, answerController.update);


module.exports = router;
