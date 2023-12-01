const express = require("express")
const {
	createOrder,
	getUserOrder,
	getOrder,
	getSellerOrders,
	updateOrderStatus,
} = require("../controller/orderController")
const { isAuthenticated } = require("../middleware/auth")

const router = express.Router()
router.route("/").post(isAuthenticated, createOrder)
router.route("/").get(isAuthenticated, getUserOrder)
router.route("/:id").get(isAuthenticated, getOrder)
router.route("/seller/items").get(isAuthenticated, getSellerOrders)
router.route("/:id").put(isAuthenticated, updateOrderStatus)

module.exports = router
