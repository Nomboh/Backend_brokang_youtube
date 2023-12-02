const express = require("express")

const {
	register,
	login,
	activateUser,
	forgotPassword,
	resetPassword,
	updatePassword,
	loadUser,
	logoutUser,
} = require("../controller/authController")

const { isAuthenticated, restrictToAdmin } = require("../middleware/auth")

const {
	deactiveUser,
	getSingleUser,
	getUsers,
	updateMe,
	addAddress,
	removeAddress,
	addWithdrawalAccount,
	removeWithdrawalAccount,
} = require("../controller/userController")

const router = express.Router()

// auth routes
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/activate").post(activateUser)
router.route("/forgotPassword").post(forgotPassword)
router.route("/loadUser").get(isAuthenticated, loadUser)
router.route("/logout").post(isAuthenticated, logoutUser)
router.route("/resetPassword/:token").post(resetPassword)

router.route("/updatePassword").put(isAuthenticated, updatePassword)

// user routes
router.route("/").get(isAuthenticated, restrictToAdmin("admin"), getUsers)
router.route("/:userId").get(getSingleUser)
router.route("/me").put(isAuthenticated, updateMe)
router.route("/address/addAddress").put(isAuthenticated, addAddress)
router
	.route("/address/removeAddress/:addressId")
	.put(isAuthenticated, removeAddress)
router
	.route("/deactivate/:userId")
	.put(isAuthenticated, restrictToAdmin("admin"), deactiveUser)

router.route("/account/add").post(isAuthenticated, addWithdrawalAccount)
router
	.route("/account/remove/:id")
	.put(isAuthenticated, removeWithdrawalAccount)

module.exports = router
