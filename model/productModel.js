const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "A product most have a title"],
			maxLength: [40, "A product length can not be more than 40"],
			minLength: [5, "A product length can not be less than 10"],
		},
		brand: {
			type: String,
			dafault: "no brand",
			lowerCase: true,
		},
		originalPrice: {
			type: Number,
			require: [true, "A product most have a price"],
		},

		discountPrice: Number,
		images: [String],
		description: {
			type: String,
			required: [true, "A product most have a description"],
		},

		shippingFee: {
			type: Number,
			required: [true, "Shipping fee is required"],
		},

		description: {
			type: String,
			required: [true, "A product most have a description"],
		},

		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
		},

		size: String,

		condition: {
			type: String,
			enum: {
				values: ["new", "used", "semiused"],
				message: "condition has to be new , used, semiused",
			},
		},

		status: {
			type: String,
			enum: {
				values: ["sale", "under reservation", "sold out", "hide"],
				message: "status is incorrect",
			},
			default: "sale",
		},

		category: {
			type: String,
			required: [true, "category is required"],
		},

		tags: [String],

		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, "Ratings most be above 1.0"],
			max: [5, "Ratings most be below 5.0"],
		},

		ratingsQuantity: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
)

const Product = mongoose.model("Product", productSchema)
module.exports = Product
