const Client = require("pg").Client;
require("dotenv").config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true }
});


module.exports = client
