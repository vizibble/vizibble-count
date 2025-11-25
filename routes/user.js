const express = require("express");
const router = express.Router();
const { displayHome, GetIndexData, getRecords, getDailyData } = require("../controllers/user.js");

router.route("/widgets")
    .get(displayHome);

router.route("/widgets/data")
    .get(GetIndexData);

router.route("/records")
    .get((_, res) => { res.render("records.ejs") });

router.route("/records/data")
    .get(getRecords)

router.route("/records/chart")
    .get((_, res) => { res.render("daily.ejs") });

router.route("/records/chart/data")
    .get(getDailyData);

module.exports = router;