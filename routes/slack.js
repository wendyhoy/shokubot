const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const knex = require('../db');
const content = require('../content.js');

// TODO: add slack controller actions
// const { create } = require('../controllers/slack');

const teamController = require('../controllers/team_controller');
const userController = require('../controllers/user_controller');
const { sendToSlackResponseUrl } = require('../helpers/helper_functions');

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
// PATH: /slack/actions
// TODO: make callback async, i.e., async (req, res) => ...
router.post('/actions', urlEncodedParser, (req, res) => {
  // respond with ok status
  res.status(200).end();

  // set up message
  let message = {
    replace_original: true
  };

  // parse payload
  const actionJSONPayload = JSON.parse(req.body.payload);
  const slack_user_id = actionJSONPayload.user.id;

  // find the slack user in the database
  // if method is async, can use await and don't need 'then'
  // const users = await knex.select('id')
  knex.select('id')
    .from('users')
    .where('slack_user_id', slack_user_id)
    .then(users => {

      const userId = users[0].id;
      const callbackId = actionJSONPayload.callback_id;
      const answer = actionJSONPayload.actions[0].value === 'yes' ? true : false;

      // save response and send next message
      switch (callbackId) {

        case content.autonomy.callback_id:
          knex('answers').insert({
            user_id: userId,
            autonomy: answer
          })
          .then(() => {
            console.log('Autonomy answer saved to the database.');
          })
          .catch(error => {
            // TODO: handle error
            console.error(error);
          });

          message.attachments = [
            {
              ...content.complexity
            }
          ];
          break;

        case content.complexity.callback_id:

          // if method is async, can use await and don't need 'then'
          // const answers = await knex.select()
          knex.select()
            .from('answers')
            .where('user_id', userId)
            .orderBy('updated_at', 'desc')
            .limit(1)
            .then(answers => {
              return knex('answers')
              .where('id', answers[0].id)
              .update({
                complexity: answer
              });
            })
            .then(() => {
              console.log('Complexity answer saved to the database.');
            })
            .catch(error => {
              // TODO: handle error
              console.error(error);
            });

          message.attachments = [
            {
              ...content.reward
            }
          ];
          break;

        case content.reward.callback_id:
          knex.select()
            .from('answers')
            .where('user_id', userId)
            .orderBy('updated_at', 'desc')
            .limit(1)
            .then(answers => {
              return knex('answers')
              .where('id', answers[0].id)
              .update({
                reward: answer
              });
            })
            .then(() => {
              console.log('Reward answer saved to the database.');
            })
            .catch(error => {
              // TODO: handle error
              console.error(error);
            });

            message.attachments = [
              {
                ...content.done
              }
            ];
          break;

        default:
          message.text = 'Sorry, something went wrong.';
          break;
      }

      sendToSlackResponseUrl(actionJSONPayload.response_url, message);
    })
    .catch(error => {
      // TODO: handle error
      console.error(error);
    });
});

// TODO:This file should only call controller actions
// router.post('/path', create)


module.exports = router;
