const sql = require("../service/db");

const Get_User_By_Email_Query = async (email) => {
    try {
        const rows = await sql`
        SELECT id, password
        FROM users
        WHERE email = ${email};
    `;
        return rows[0] || null;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    Get_User_By_Email_Query
}