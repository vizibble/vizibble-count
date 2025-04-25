const express = require("express")
const router = express.Router()

// const { reduce_decimal } = require("../middleware/uniforming_post_data")
const { handleDataFromDevice } = require("../controllers/Data_from_device")

router.route("/eastmen/:id")
    .post(handleDataFromDevice)

module.exports = router