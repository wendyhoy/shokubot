# Getting Started

## Description

This file describes the steps taken to start this project.

## Step 1: Create Express project

Use express generator to create a default express project. Make sure express generator is installed:

```
$ npm install express-generator -g
```

Create project with ejs as the view engine:

```
$ express shokubot --view=ejs
```

Install default node modules:

```
$ cd 01_note_saver && npm install
```

Set up git repository and create .gitignore file:

```
$ git init
$ curl https://www.gitignore.io/api/node,macos > .gitignore
```

Install additional modules for slack, database integration, nodemon, etc.:

```
$ npm install @slack/client dotenv request knex pg
$ npm install nodemon --save-dev
```

In package.json, modify the start script to use nodemon:

```
"start": "nodemon ./bin/www"
```

Test that server starts:

```
$ npm run start
```

## Step 2: Create database

In package.json, add the following scripts to manage the database:

```
"db:create": "createdb -e shokubot_dev",
"db:drop": "dropdb -e --if-exists shokubot_dev"
```

Run the db:create script and initialize knex:

```
$ npm run db:create
$ knex init
```

Modify knexfile.js with database configurations.

## Step 3: Set up ngrok tunnel

To develop locally for slack, follow these instructions to download and install ngrok to your system's `$PATH` directory:

[https://api.slack.com/tutorials/tunneling-with-ngrok](https://api.slack.com/tutorials/tunneling-with-ngrok)

In bin/www, make sure the dotenv module is required at the top of the file:

```
require('dotenv').config();
```

Create a `.env` file in the project directory, and set the PORT variable to 4390:

```
PORT=4390
```

Restart the server in one terminal:

```
$ npm run start
```

Start ngrok in another:

```
$ ngrok http 4390
```

Visit one of the ngrok forwarding addresses listed in the ngrok terminal to make sure everything is running.

## Resources
[https://expressjs.com/en/starter/generator.html](https://expressjs.com/en/starter/generator.html)
[https://github.com/slackapi/node-slack-sdk](https://github.com/slackapi/node-slack-sdk)
[https://www.npmjs.com/package/dotenv](https://www.npmjs.com/package/dotenv)
[https://www.npmjs.com/package/request](https://www.npmjs.com/package/request)
[https://api.slack.com/tutorials/tunneling-with-ngrok](https://api.slack.com/tutorials/tunneling-with-ngrok)
