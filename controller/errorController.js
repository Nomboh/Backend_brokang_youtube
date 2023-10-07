const AppError = require("../utils/AppError")

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500
	err.status = err.status || "error"

	// 1. handle cast error objectId(kdifkeoe) ier5544sdf
	if (err.name === "CastError") {
		const castMessage = `Invalid parameters: ${err.path}: ${err.value}`
		err = new AppError(castMessage, 400)
	}

	// 2. handle validation errors
	if (err.name === "ValidationError") {
		const messages = Object.values(err.errors).map((el) => el.message)
		const validationMsg = `Invalid input data ${messages.join(".")}`
		err = new AppError(validationMsg, 400)
	}

	// 3. Dublicate data error {ieri} => ieri
	if (err.code === 11000) {
		const regex = /\{([^}]*)\}/
		const match = err.message.match(regex)

		let str = ""

		if (match && match.length > 1) {
			str = match[1]
		} else {
			str = "A field"
		}

		const dublicateMsg = `${str} already exist. try a different value`

		err = new AppError(dublicateMsg, 400)
	}

	// 4. handle wrong jwt error
	if (err.name === "JsonWebTokenError") {
		const jwtMsg = `Your url is invalid try again latter`
		err = new AppError(jwtMsg, 400)
	}

	// 5. handle expired jwt error
	if (err.name === "TokenExpiredError") {
		const jwtMsg = `Your url has expired try again latter`
		err = new AppError(jwtMsg, 400)
	}

	if (process.env.NODE_ENV === "production") {
		// development errors
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		})
	} else {
		console.log(err)
		res.status(err.statusCode).json({
			// product errors
			status: err.status,
			message: err.message,
			stack: err.stack,
		})
	}
}
