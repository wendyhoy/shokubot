const express = require('express');
const router = express.Router();

const TeamsController = require('../../../controllers/api/v1/teams_controller');

// Handle api request to get all teams
// VERB: GET
// PATH: /api/v1/teams
router.get('/', TeamsController.index);

// Handle add to slack request
// VERB: GET
// PATH: /api/v1/teams/new
router.get('/new', TeamsController.new);

// Handle api request to show specific team
// VERB: GET
// PATH: /api/v1/teams/:id
router.get('/:id', TeamsController.show);

module.exports = router;
