const express = require("express")
const {
	createSubscription,
	checkSubscription,
	deleteSubscription,
	getAllSubscriptions,
} = require("../controller/subscriptionController")
const { isAuthenticated } = require("../middleware/auth")

const router = express.Router()
router.route("/:sellerId").post(isAuthenticated, createSubscription)
router.route("/unsubscribe/:sellerId").post(isAuthenticated, deleteSubscription)
router.route("/:sellerId").get(isAuthenticated, getAllSubscriptions)
router.route("/check/:sellerId").get(isAuthenticated, checkSubscription)

module.exports = router
