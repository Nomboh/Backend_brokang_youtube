const express = require("express")
const {
	createMessage,
	getMessages,
} = require("../controller/messageController")
const { isAuthenticated } = require("../middleware/auth")

const router = express.Router()
router.route("/").post(isAuthenticated, createMessage)
router.route("/:id").get(isAuthenticated, getMessages)

module.exports = router
