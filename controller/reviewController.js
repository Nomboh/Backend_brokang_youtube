const Review = require("../model/reviewModel")
const catchAsync = require("../utils/catchAsync")

// createReview
exports.createReview = catchAsync(async (req, res, next) => {
	if (!req.body.product) req.body.product = req.params.productId
	if (!req.body.user) req.body.user = req.user.id

	const newReview = await Review.create(req.body)

	res.status(201).json({
		success: true,
		review: newReview,
	})
})

// get all reviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
	const reviews = await Review.find()

	res.status(200).json({
		success: true,
		reviews,
	})
})

// get all reviews of a seller
exports.getSellersReviews = catchAsync(async (req, res, next) => {
	const reviews = await Review.find({ seller: req.params.sellerId })

	res.status(200).json({
		success: true,
		reviews,
	})
})

// delete a review
exports.deleteReview = catchAsync(async (req, res, next) => {
	await Review.findByIdAndDelete(req.params.id)

	res.status(204).json({
		success: true,
	})
})
