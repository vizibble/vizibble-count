require('dotenv').config();
const { JWTVerification } = require('../service/userAutehntication.js');


const JWTMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Unauthorised Access`);
        return res.status(401).redirect(`/`);
    }
    const decoded = JWTVerification(token);
    if (!decoded) {
        return res.redirect(`/`);
    }
    req.user = decoded.id;
    next();
}
module.exports = { JWTMiddleware }