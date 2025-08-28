const express = require("express");
const { displayLogin, validateLogin } = require("../controllers/auth");
const router = express.Router()

router.route("/")
    .get(displayLogin)
    .post(validateLogin);

module.exports = router