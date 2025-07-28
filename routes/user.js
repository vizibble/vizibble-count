const express = require("express");
const router = express.Router();
const { displayHome, GetWidgetData, getRecords } = require("../controllers/user.js");

router.route("/")
    .get(displayHome);

router.route("/records")
    .get((req, res) => { res.render("records.ejs") });
router.route("/records/data")
    .get(getRecords)

router.route("/widgets/data")
    .get(GetWidgetData);

module.exports = router;