const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true }
});

pool.on("error", (err) => {
    console.error("❌ PG Pool error:", err.message);
});

module.exports = pool
