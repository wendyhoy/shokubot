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
      database: 'shokubot_dev'
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
      database: 'postgres://ihegqtrysvrzzv:8f1018e91794bbec96514fa4f5cf521fb2023ed62c427f88a5b99a72da5cf8b6@ec2-54-83-23-91.compute-1.amazonaws.com:5432/d1hqvhbatltth6'
    }
  }

};
