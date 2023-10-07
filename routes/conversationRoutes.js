const express = require("express")
const {
	createConversation,
	getCurrentConversations,
	getUserConversations,
} = require("../controller/conversationController")
const { isAuthenticated } = require("../middleware/auth")

const router = express.Router()
router.route("/").post(isAuthenticated, createConversation)
router.route("/:id").get(isAuthenticated, getCurrentConversations)
router.route("/").get(isAuthenticated, getUserConversations)

module.exports = router
