const User = require("../model/userModel")
const AppError = require("../utils/AppError")
const catchAsync = require("../utils/catchAsync")
const jwt = require("jsonwebtoken")

exports.isAuthenticated = catchAsync(async (req, res, next) => {
	// 1. get token from req.cookies
	const { bk_token } = req.cookies

	if (!bk_token) return next(new AppError("Please login to continue", 401))

	// 2. decode token if available
	const decode = jwt.verify(bk_token, process.env.JWT_SECRET)
	// { id: '6514b399d3d890b8fcca8850', iat: 1695949470, exp: 1696554270 }

	// 3. find user base on decoded token
	const user = await User.findById(decode.id)
	if (!user) {
		return next(
			new AppError(
				"The user belonging to this token is no longer available",
				404
			)
		)
	}

	// 4. check if password changed after jwt was issued

	if (user.changedPasswordAfter(decode.iat))
		return next(new AppError("User recently changed thier password", 400))

	// 5. set user to the request object
	req.user = user

	next()
})

exports.restrictToAdmin = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError(`${req.user.role} can not access this resource`, 400)
			)
		}

		return next()
	}
}
