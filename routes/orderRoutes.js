const express = require("express")
const {
	createOrder,
	getUserOrder,
	getOrder,
} = require("../controller/orderController")
const { isAuthenticated } = require("../middleware/auth")

const router = express.Router()
router.route("/").post(isAuthenticated, createOrder)
router.route("/user").get(isAuthenticated, getUserOrder)
router.route("/:id").get(isAuthenticated, getOrder)

module.exports = router
