const express = require("express")
const {
	createReview,
	getAllReviews,
	getSellersReviews,
	deleteReview,
} = require("../controller/reviewController")
const { isAuthenticated } = require("../middleware/auth")

const router = express.Router()

router.route("/:productId").post(isAuthenticated, createReview)
router.route("/").get(isAuthenticated, getAllReviews)
router.route("/:sellerId").get(isAuthenticated, getSellersReviews)
router.route("/:id").delete(isAuthenticated, deleteReview)

module.exports = router
