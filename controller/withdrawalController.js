const catchAsync = require("../utils/catchAsync")
const User = require("../model/userModel")
const AppError = require("../utils/AppError")
const Withdrawal = require("../model/withdrawalModel")
const novu = require("../utils/novu")

// createWithdrawalRequest
exports.createWithdrawalRequest = catchAsync(async (req, res, next) => {
	const { paymentInfo, amount } = req.body

	const user = await User.findById(req.user.id)

	if (amount > user.availableBalance) {
		return next(new AppError("Insufficient Balance", 400))
	}

	const withdrawal = await Withdrawal.create({
		user: req.user.id,
		amount,
		paymentInfo,
	})

	user.availableBalance -= amount
	user.accountBalance -= amount
	await user.save()

	res.status(201).json({
		status: "success",
		withdrawal,
	})
})

// updateWithdrawalRequests
exports.updateWithdrawalRequests = catchAsync(async (req, res, next) => {
	const { status, userId } = req.body

	const withdrawal = await Withdrawal.findById(req.params.id)
	const user = await User.findById(userId)

	if (!withdrawal) {
		return next(new AppError("Withdrawal request not found", 404))
	}

	if (status === "Rejected") {
		user.availableBalance += withdrawal.amount
		user.accountBalance += withdrawal.amount
		await user.save()
	}

	withdrawal.status = status
	await withdrawal.save({ validateBeforeSave: false, new: true })

	// send message to user email
	try {
		await novu.trigger("payment_brokang_youtube", {
			to: {
				subscriberId: user?._id,
				email: user?.email,
			},
			payload: {
				amount: withdrawal.amount,
				accountNumber: withdrawal.paymentInfo.accountNumber.slice(-4),
			},
		})
	} catch (error) {
		console.log(error)
		return next(new AppError("Error sending email", 500))
	}

	res.status(200).json({
		status: "success",
		withdrawal,
	})
})

// getWithdrawalRequests
exports.getWithdrawalRequests = catchAsync(async (req, res, next) => {
	const queryObject = req.query.status ? { status: req.query.status } : {}
	const withdrawals = await Withdrawal.find(queryObject).populate("user")

	res.status(200).json({
		status: "success",
		withdrawals,
	})
})

// user getWithdrawalRequest
exports.getUserWithdrawalRequests = catchAsync(async (req, res, next) => {
	const withdrawals = await Withdrawal.find({ user: req.user.id })

	res.status(200).json({
		status: "success",
		withdrawals,
	})
})
