const { query } = require("../service/db");

const Get_User_By_Email_Query = async (email) => {
    try {
        const queryText = `
        SELECT id, password
        FROM users
        WHERE email = $1;
    `;
        const { rows } = await query(queryText, [email]);
        return rows[0] || null;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    Get_User_By_Email_Query
}