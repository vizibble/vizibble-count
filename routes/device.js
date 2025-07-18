const express = require("express")
const router = express.Router()

const { handleDataFromDevice } = require("../controllers/device")

router.route("/:id")
    .post(handleDataFromDevice)

module.exports = router