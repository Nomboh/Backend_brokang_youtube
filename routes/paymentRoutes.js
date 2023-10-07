const express = require("express")
const { processPayment } = require("../controller/paymentController")
const { isAuthenticated } = require("../middleware/auth")

const router = express.Router()
router.route("/").post(isAuthenticated, processPayment)

module.exports = router
