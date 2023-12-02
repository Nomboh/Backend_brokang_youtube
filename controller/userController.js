const User = require("../model/userModel")
const AppError = require("../utils/AppError")
const catchAsync = require("../utils/catchAsync")

/* 
{name: "quentin", storename: "quenstore", email: "quent@brokand"}
 */
const excludeFields = (requestBody, ...fieldsToInclude) => {
	const newObject = {}
	// [name, storename, email]
	Object.keys(requestBody).forEach((el) => {
		if (fieldsToInclude.includes(el)) newObject[el] = requestBody[el]
	})

	return newObject
}

// update me
exports.updateMe = catchAsync(async (req, res, next) => {
	// check if password is part of the properties to be updated
	if (req.body.password) {
		return next(
			new AppError("This route cannot be use to update password", 400)
		)
	}

	const fieldsToUpdate = excludeFields(
		req.body,
		"email",
		"storename",
		"introduction",
		"photo",
		"bannerImage"
	)

	const updateUser = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	})

	res.status(200).json({
		success: true,
		user: updateUser,
	})
})

// get all users
exports.getUsers = catchAsync(async (req, res, next) => {
	const users = await User.find()

	res.status(200).json({
		success: true,
		users,
	})
})

// get a single user
exports.getSingleUser = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.userId)

	res.status(200).json({
		success: true,
		user,
	})
})

// deactivate user
exports.deactiveUser = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.params.userId)

	res.status(200).json({
		success: true,
		message: "successfully deactivated the user",
	})
})

// add address
exports.addAddress = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(
		req.user.id,
		{
			$push: {
				address: req.body,
			},
		},
		{ new: true, runValidators: false }
	)

	res.status(200).json({
		success: true,
		user,
	})
})

// remove address
exports.removeAddress = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(
		req.user.id,
		{
			$pull: {
				address: {
					_id: req.params.addressId,
				},
			},
		},
		{ new: true, runValidators: false }
	)

	res.status(200).json({
		success: true,
		user,
	})
})

// add withdrawal account
exports.addWithdrawalAccount = catchAsync(async (req, res, next) => {
	const { accountName, accountNumber, bankName, swiftCode } = req.body

	await User.findByIdAndUpdate(req.user.id, {
		$push: {
			withdrawalAccounts: {
				accountName,
				accountNumber,
				bankName,
				swiftCode,
			},
		},
	})

	res.status(200).json({
		success: true,
		message: "withdrawal account added successfully",
	})
})

exports.removeWithdrawalAccount = catchAsync(async (req, res, next) => {
	const withdrawalId = req.params.id

	await User.findByIdAndUpdate(req.user.id, {
		$pull: {
			withdrawalAccounts: {
				_id: withdrawalId,
			},
		},
	})

	res.status(200).json({
		success: true,
		message: "withdrawal account removed successfully",
	})
})
