const express = require("express")
const { getUserLikes, like, unlike } = require("../controller/likeController")
const { isAuthenticated } = require("../middleware/auth")

const router = express.Router()
router.route("/:productId").post(isAuthenticated, like)
router.route("/unlike/:productId").post(isAuthenticated, unlike)
router.route("/").get(isAuthenticated, getUserLikes)

module.exports = router
