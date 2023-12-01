const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
	shippingAddress: {
		type: String,
		required: true,
	},
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	seller: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	totalPrice: {
		type: Number,
		required: true,
	},
	status: {
		type: String,
		default: "Processing",
	},
	paidAt: {
		type: Date,
		default: Date.now(),
	},
	deliveredAt: Date,
	paymentInfo: Object,
})

const Order = mongoose.model("Order", orderSchema)
module.exports = Order
