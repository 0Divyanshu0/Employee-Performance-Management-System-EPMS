// epms-backend/db.js
const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  authentication: {
    type: 'ntlm',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      domain: process.env.DB_DOMAIN,
    },
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    requestTimeout: 30000,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('Connected to MS SQL Database using Windows Auth (NTLM)');
    return pool;
  })
  .catch((err) => {
    console.error('Database Connection Failed! 😢');
    console.error('Details:', err.originalError?.info?.message || err.message);
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise,
};
