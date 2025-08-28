require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

(async () => {
    try {
        const result = await sql`SELECT NOW() AS current_time;`;
        console.log("Connected! Current time from DB:", result[0].current_time);
    } catch (err) {
        console.error("Database query failed:", err);
    }
})();

module.exports = sql;