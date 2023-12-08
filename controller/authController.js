const User = require("../model/userModel")
const jwt = require("jsonwebtoken")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")
const novu = require("../utils/novu")
const crypto = require("crypto")

const createActivationToken = (user) => {
	return jwt.sign(user, process.env.ACTIVATION_SECRET, { expiresIn: "10m" })
}

const sendJwtToken = (userId) => {
	return jwt.sign(
		{
			id: userId,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_SECRET_EXP,
		}
	)
}

const cookieOptions = {
	expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
	httpOnly: true,
	sameSite: "none",
	secure: true,
}

// Register a new
exports.register = catchAsync(async (req, res, next) => {
	const { email, storename, password, name } = req.body

	// 1. Activation token
	const activationToken = createActivationToken({
		email,
		storename,
		password,
		name,
	})

	// 2. Confirmation Link
	const confirmationLink = `${process.env.FRONTEND_URL}/activation?activationToken=${activationToken}`

	// 3. Create a subscriber using our storename
	await novu.subscribers.identify(storename, {
		firstName: name,
		email,
	})

	// 4. Trigger notifaction to send email
	await novu.trigger("account-activation-MIlr_U2ld", {
		to: {
			subscriberId: storename,
		},
		payload: {
			companyName: "Brokang",
			confirmationLink,
		},
	})
	// 5. send response
	res.status(200).json({
		success: true,
		message: `Please go to your email -${email} to activate your account`,
	})
})

// Activate user
exports.activateUser = catchAsync(async (req, res, next) => {
	// 1. Verify token
	const userData = jwt.verify(
		req.body.activationToken,
		process.env.ACTIVATION_SECRET
	)

	// 2. check if user data is available and find the user
	if (!userData) return next(new AppError("your token is wrong", 400))

	let user = await User.findOne({ email: userData.email })

	// 3. if there is a user, throw error else create user
	if (user) {
		return next(new AppError("User already exist", 400))
	} else {
		user = await User.create(userData)
		// 4. delete subscribe with storename
		await novu.subscribers.delete(userData.storename)

		// 5. create subscriber with newly create userId
		await novu.subscribers.identify(user._id, {
			firstName: user.name,
			email: user.email,
		})
	}

	// 6. send response
	res.status(201).json({
		success: true,
		// user,
	})
})

// login user
exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body

	// 1.get user from db using email
	const dbUser = await User.findOne({ email }).select("+password")

	// 2.check if user exist
	if (!dbUser) {
		next(new AppError("we don't have a user with that email", 400))
	} else {
		// 3. compare passwords
		const comparePassword = await dbUser.comparePassword(
			password,
			dbUser.password
		)

		if (comparePassword) {
			// 4. create a jsonwebtoken
			const token = sendJwtToken(dbUser._id)

			res.status(200).cookie("bk_token", token, cookieOptions).json({
				success: true,
				token,
			})
		} else {
			next(new AppError("Password or email is incorrect", 400))
		}
	}
})

// forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1. find user by email is no user throw error
	const user = await User.findOne({ email: req.body.email })

	if (!user)
		return next(new AppError("There is no user with this email address", 404))

	// 2. generate a random reset token
	const resetToken = user.generateResetToken()
	await user.save({ validateBeforeSave: false })

	// 3. construct our reset link
	const urlReset = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`

	// 4. send reset token to users email
	try {
		await novu.trigger("password-reset-O4wxRlK3N", {
			to: {
				subscriberId: user?._id,
				email: user.email,
			},
			payload: {
				resetLink: urlReset,
				securityEmail: "brokang@gmail.com",
			},
		})
	} catch (error) {
		console.log(error)
		user.passswordResetExpires = undefined
		user.passwordResetToken = undefined

		await user.save({ validateBeforeSave: false })

		return next(new AppError("There was an error sending your email", 500))
	}

	res.status(200).json({
		success: true,
		message: `check your email - ${req.body.email} for link`,
	})
})

// reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
	const { password, confirmPassword } = req.body
	const token = req.params.token

	// 1.take token from req parameter
	const hashedResetToken = crypto
		.createHash("SHA-256")
		.update(token)
		.digest("hex")

	// 2. hash token to find user in the database
	const user = await User.findOne({
		passwordResetToken: hashedResetToken,
		passswordResetExpires: { $gt: Date.now() },
	})

	if (!user) return next(new AppError("Token is in valid or has expired", 400))

	// 3. check if password and confirmPassword match if not throw an error
	if (password !== confirmPassword) {
		return next(new AppError("Password do not match", 400))
	} else {
		// 4. set password, set passwordresetexpire, passwordresettoken and send jwt token
		user.password = password
		user.passswordResetExpires = undefined
		user.passwordResetToken = undefined

		user.save({ validateBeforeSave: false })

		const jwtToken = sendJwtToken(user._id)

		res.status(200).cookie("bk_token", jwtToken, cookieOptions).json({
			success: true,
			token: jwtToken,
		})
	}
})

// update User password
exports.updatePassword = catchAsync(async (req, res, next) => {
	// 1. get user from req.user
	const userId = req.user.id
	const user = await User.findById(userId).select("+password")
	const { currentPassword, newPassword } = req.body

	// 2. check if the current password is correct
	const isPasswordCorrect = await user.comparePassword(
		currentPassword,
		user.password
	)
	if (!isPasswordCorrect)
		return next(
			new AppError("Current password do not match. please try again", 400)
		)

	// 3. update password
	user.password = newPassword
	user.passwordChangedAt = Date.now()
	await user.save()

	// 4. log user in, send jwt
	const jwtToken = sendJwtToken(user._id)

	res.status(200).cookie("bk_token", jwtToken, cookieOptions).json({
		success: true,
		token: jwtToken,
	})
})

//Load user
exports.loadUser = catchAsync(async (req, res, next) => {
	const userId = req.user.id
	const user = await User.findById(userId).populate("likes")

	res.status(200).json({
		success: true,
		user,
	})
})

//logout user
exports.logoutUser = catchAsync(async (req, res, next) => {
	res.cookie("bk_token", null, {
		expires: new Date(Date.now()),
		httpOnly: true,
		sameSite: "none",
		secure: true,
	})

	res.status(200).json({
		success: true,
		message: "User logged out successfully",
	})
})
