const mongoose = require("mongoose")

const withdrawalSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	status: {
		type: String,
		default: "Processing",
	},
	paymentInfo: {
		type: Object,
	},
})

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema)
module.exports = Withdrawal
