const express = require("express")
const { isAuthenticated, restrictToAdmin } = require("../middleware/auth")
const withdrawalController = require("../controller/withdrawalController")
const router = express.Router()

router
	.route("/")
	.post(isAuthenticated, withdrawalController.createWithdrawalRequest)

router
	.route("/:id")
	.put(
		isAuthenticated,
		restrictToAdmin("admin"),
		withdrawalController.updateWithdrawalRequests
	)

router
	.route("/")
	.get(isAuthenticated, withdrawalController.getWithdrawalRequests)
router
	.route("/user")
	.get(isAuthenticated, withdrawalController.getUserWithdrawalRequests)

module.exports = router
