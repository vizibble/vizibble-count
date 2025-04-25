const express = require("express");
const router = express.Router();
const { displayHome, GetWidgetData } = require("../controllers/Frontend.js");

router.route("/")
    .get(displayHome);

router.route("/widgets/data")
    .get(GetWidgetData);

module.exports = router;