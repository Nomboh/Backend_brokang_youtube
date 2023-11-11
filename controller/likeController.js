const Like = require("../model/likeModel")
const catchAsync = require("../utils/catchAsync")

// like user
exports.like = catchAsync(async (req, res, next) => {
	if (!req.body.product) req.body.product = req.params.productId
	if (!req.body.user) req.body.user = req.user.id

	await Like.create(req.body)

	res.status(201).json({
		success: true,
		message: "product liked ",
	})
})

// unlike user
exports.unlike = catchAsync(async (req, res, next) => {
	const product = req.params.productId
	const user = (req.body.user = req.user.id)

	await Like.findOneAndDelete({ user, product })

	res.status(201).json({
		success: true,
		message: "product unliked ",
	})
})

// get user likes
exports.getUserLikes = catchAsync(async (req, res, next) => {
	const likes = await Like.find({ user: req.user.id }).populate("product")

	res.status(200).json({
		success: true,
		likes,
	})
})
