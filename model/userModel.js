const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "fullname is required"],
		},

		email: {
			type: String,
			required: [true, "email is required"],
			unique: true,
			lowercase: true,
		},

		password: {
			type: String,
			required: [true, "Password is required"],
			minLength: [6, "Password should be greater than 6 character"],
			select: false,
		},

		photo: {
			type: String,
			default:
				"https://res.cloudinary.com/queentech/image/upload/v1690010294/78695default-profile-picture1_dhkeeb.jpg",
		},

		storename: {
			type: String,
			unique: true,
			required: [true, "Username is required"],
			lowercase: true,
		},

		introduction: String,
		numProducts: { type: Number, default: 0 },
		bannerImage: {
			type: String,
			default:
				"https://plus.unsplash.com/premium_photo-1664302438823-41e4fe999f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1460&q=80",
		},

		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},

		availableBalance: {
			type: Number,
			default: 0,
		},

		accountBalance: {
			type: Number,
			default: 0,
		},

		withdrawalAccounts: [
			{
				accountName: String,
				accountNumber: String,
				bankName: String,
				swiftCode: String,
			},
		],

		address: [
			{
				address: String,
				addressType: String,
			},
		],

		passwordChangedAt: Date,
		passwordResetToken: String,
		passswordResetExpires: Date,
		active: {
			type: Boolean,
			default: true,
			select: false,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

userSchema.virtual("likes", {
	ref: "Like",
	foreignField: "user",
	localField: "_id",
})

userSchema.pre("save", async function (next) {
	// if password has not been modified
	if (!this.isModified("password")) return next()

	// hashing of password
	const hashedPassword = await bcrypt.hash(this.password, 12)
	this.password = hashedPassword
	next()
})

userSchema.pre("save", async function (next) {
	if (!this.isModified("passwordChangedAt") || this.isNew) return next()
	this.passwordChangedAt = Date.now() - 1000
})

userSchema.pre(/^find/, function (next) {
	this.find({ active: true })
	next()
})

// instance method to hash password
userSchema.methods.comparePassword = async function (userPassword, dbPassword) {
	return await bcrypt.compare(userPassword, dbPassword)
}

// instance method to generateResetToken
userSchema.methods.generateResetToken = function () {
	// create resetToken using crypto
	const resetToken = crypto.randomBytes(32).toString("hex")

	const hashedResetToken = crypto
		.createHash("SHA-256")
		.update(resetToken)
		.digest("hex")

	this.passwordResetToken = hashedResetToken
	this.passswordResetExpires = Date.now() + 10 * 60 * 1000

	return resetToken
}

// instance method to check if password was change before the token issued
userSchema.methods.changedPasswordAfter = function (jwtTimeSpan) {
	if (this.passwordChangedAt) {
		const changedTime = parseInt(this.passwordChangedAt.getTime() / 1000)
		return jwtTimeSpan < changedTime
	}
	return false
}

const User = mongoose.model("User", userSchema)

module.exports = User
