const jwt = require("jsonwebtoken")
require('dotenv').config()
const JWTSecretKey = process.env.JWTSecretKey;

const JWTGeneration = (userData) => {
    return jwt.sign(
        userData,
        JWTSecretKey,
        {
            expiresIn: "30d"
        }
    )
}

const JWTVerification = (token) => {
    try {
        const decoded = jwt.verify(token, JWTSecretKey);
        return decoded;
    } catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error validating token: ${err.message}`);
        return null;
    }
}

module.exports = { JWTGeneration, JWTVerification }