const express = require("express")
const router = express.Router()

const { handleDataFromDevice } = require("../controllers/device")
const { deviceRateLimiter } = require("../middleware/rateLimiter")

router.route("/:id")
    .post(deviceRateLimiter, handleDataFromDevice)

module.exports = router