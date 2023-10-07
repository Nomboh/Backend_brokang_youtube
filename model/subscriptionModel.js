const mongoose = require("mongoose")

const subscriptionSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: [true, "a user is required"],
	},

	seller: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: [true, "a seller is required"],
	},
})

const Subscription = mongoose.model("Subscription", subscriptionSchema)
module.exports = Subscription
