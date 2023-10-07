const express = require("express")
const {
	followUser,
	getFollowee,
	getFollower,
	unfollowUser,
} = require("../controller/followersController")
const { isAuthenticated } = require("../middleware/auth")

const router = express.Router()
router.route("/").post(isAuthenticated, followUser)
router.route("/unfollow").post(isAuthenticated, unfollowUser)

router.route("/follower").get(isAuthenticated, getFollower)
router.route("/followee").get(isAuthenticated, getFollowee)

module.exports = router
