const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

const AnswersController = require('../../../controllers/api/v1/answers_controller');

// Handles button clicks from interactive messages
// VERB: POST
// PATH: /api/v1/answers
router.post('/', urlEncodedParser, AnswersController.create);

module.exports = router;
