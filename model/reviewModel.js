const mongoose = require("mongoose")
const Product = require("./productModel")

const reviewSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
	},

	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},

	seller: String,
	review: String,
	rating: {
		type: Number,
		min: 1,
		max: 5,
	},
})

reviewSchema.index({ product: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function (next) {
	this.populate({
		path: "user",
		select: "name photo",
	}).populate({
		path: "product",
		select: "title user",
	})

	next()
})

reviewSchema.statics.calculateAvgRating = async function (productId) {
	const statistics = await this.aggregate([
		{
			$match: {
				product: productId,
			},
		},
		{
			$group: {
				_id: "$product",
				numberRating: { $sum: 1 },
				avgRating: { $avg: "$rating" },
			},
		},
	])

	if (statistics.length > 0) {
		await Product.findByIdAndUpdate(productId, {
			ratingsQuantity: statistics[0].numberRating,
			ratingsAverage: statistics[0].avgRating,
		})
	} else {
		await Product.findByIdAndUpdate(productId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5,
		})
	}
}

reviewSchema.post("save", function () {
	this.constructor.calculateAvgRating(this.product)
})

const Reviews = mongoose.model("Review", reviewSchema)
module.exports = Reviews
