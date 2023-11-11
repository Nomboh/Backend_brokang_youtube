const Subscription = require("../model/subscriptionModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")

// subscribe to a seller
exports.createSubscription = catchAsync(async (req, res, next) => {
	const { sellerId } = req.params
	const user = req.user

	// check existing subscription
	const existingSubscription = await Subscription.findOne({
		seller: sellerId,
		user: user._id,
	})
	if (existingSubscription)
		return next(new AppError("Already subscribed to this user"))

	await Subscription.create({ seller: sellerId, user: user._id })

	res.status(201).json({
		success: true,
		sellerId,
		message: "Subscription successful",
	})
})

// delete a subscription
exports.deleteSubscription = catchAsync(async (req, res, next) => {
	const { sellerId } = req.params
	const user = req.user

	await Subscription.findOneAndDelete({ user: user.id, seller: sellerId })

	res.status(200).json({
		success: true,
		sellerId,
		message: "You unsubscribed from this seller",
	})
})

// get all subscriptions
exports.getAllSubscriptions = catchAsync(async (req, res, next) => {
	const { sellerId } = req.params
	const subscriptions = await Subscription.find({
		seller: sellerId,
	})
	res.status(200).json({
		success: true,
		subscriptions,
	})
})

// check if user is subscribe to a seller
exports.checkSubscription = catchAsync(async (req, res, next) => {
	const existingSubscription = await Subscription.findOne({
		seller: req.params.sellerId,
		user: req.user._id,
	})

	if (existingSubscription) {
		res.status(200).json({ success: true })
	} else {
		res.status(200).json({ success: false })
	}
})
