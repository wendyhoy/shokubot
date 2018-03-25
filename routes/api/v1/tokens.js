const express = require('express');
const router = express.Router();

const TokensController = require('../../../controllers/api/v1/tokens_controller');

// Handle api request for access tokens
// VERB: POST
// PATH: /api/v1/tokens
router.post('/', TokensController.create);


module.exports = router;
