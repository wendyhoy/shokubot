// Update with your config settings.
const sharedConfig = {
  client: 'pg',
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './db/migrations',
    tableName: 'knex_migrations'
  }
};

module.exports = {

  development: {
    ...sharedConfig,
    connection: {
      databae: 'shokubot_dev'
    }
  },

  staging: {
    ...sharedConfig,
    connection: {
      database: 'shokubot_staging'
    }
  },

  production: {
    ...sharedConfig,
    connection: {
      database: 'shokubot_production'
    }
  }

};
