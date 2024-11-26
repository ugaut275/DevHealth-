const mysql = require('promise-mysql');
require('dotenv').config();

const connectToDatabase = async () => {
  return await mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    
    // Optional pool settings
    connectionLimit: 5,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    waitForConnections: true,
    queueLimit: 0
  });
};

module.exports.setup = connectToDatabase;