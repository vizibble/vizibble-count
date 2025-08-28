require('dotenv').config();
const jwt = require("jsonwebtoken");


const JWTMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Unauthorised Access`);
        return res.status(401).redirect(`/`);
    }
    try {
        const JWTSecretKey = process.env.JWTSecretKey;
        const decodedPayload = jwt.verify(token, JWTSecretKey);
        req.user = decodedPayload;
        next();
    } catch (err) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error validating user for admin access: ${err.message}`);
        return res.redirect(`/`);
    }
}
module.exports = { JWTMiddleware }