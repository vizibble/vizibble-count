const jwt = require("jsonwebtoken")
require('dotenv').config()
const JWTSecretKey = process.env.JWTSecretKey;

const JWTGeneration = (userData) => jwt.sign(userData, JWTSecretKey)

module.exports = { JWTGeneration }