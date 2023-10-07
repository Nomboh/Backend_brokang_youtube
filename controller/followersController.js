const Followers = require("../model/followsModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")

// follow a user
exports.followUser = catchAsync(async (req, res, next) => {
	const { follower } = req.body
	const followee = req.user.id

	const existingFollowers = await Followers.findOne({ followee, follower })

	if (existingFollowers) {
		return next(new AppError("You are already following this user"))
	}

	await Followers.create({ followee, follower })

	res.status(201).json({
		success: true,
		message: "You are now following this user",
	})
})

// unfollow a user
exports.unfollowUser = catchAsync(async (req, res, next) => {
	const { follower } = req.body
	const followee = req.user.id

	await Followers.findOneAndDelete({ followee, follower })

	res.status(200).json({
		success: true,
		message: "You have unfollow this user",
	})
})

// get all followers
exports.getFollower = catchAsync(async (req, res, next) => {
	const follower = req.user.id

	const followers = await Followers.find({ follower })
		.select("followee")
		.populate("followee")

	res.status(200).json({
		success: true,
		followers,
	})
})

// get all followee
exports.getFollowee = catchAsync(async (req, res, next) => {
	const followee = req.user.id

	const followees = await Followers.find({ followee })
		.select("follower")
		.populate("follower")

	res.status(200).json({
		success: true,
		followees,
	})
})
