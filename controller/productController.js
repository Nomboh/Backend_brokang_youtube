const Product = require("../model/productModel")
const User = require("../model/userModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")
const Subscription = require("../model/subscriptionModel")
const novu = require("../utils/novu")

const cloudinary = require("cloudinary").v2

cloudinary.config({
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	cloud_name: process.env.CLOUDINARY_NAME,
})

// seller other items
exports.getSellerOtherItems = (req, res, next) => {
	req.query.user = req.params.userId
	req.query.limit = 20
	req.query.fields = "title originalPrice createdAt user images"

	next()
}

// get recommended products
exports.getRecommendedProducts = (req, res, next) => {
	req.query.category = req.params.category
	req.query.limit = 30

	next()
}

// product filters
exports.productFilters = (req, res, next) => {
	// { brand: 'samsung', category: 'others' }
	// Filtering products
	const queryObject = { ...req.query }
	const excludedFields = ["page", "sort", "limit", "fields", "id"]

	excludedFields.forEach((el) => delete queryObject[el])

	//  Add search by title
	if (req.query.title) {
		queryObject.title = { $regex: req.query.title, $options: "i" }
	}

	let queryString = JSON.stringify(queryObject)

	queryString = queryString.replace(
		/\b(gte|gt|lte|lt|in|ne|eq)\b/g,
		(value) => `$${value}`
	)

	let parsedQuery = JSON.parse(queryString)

	if (parsedQuery.originalPrice) {
		if (parsedQuery.originalPrice.$gt) {
			parsedQuery.originalPrice.$gt = parseInt(parsedQuery.originalPrice.$gt)
		} else if (parsedQuery.originalPrice.$lt) {
			parsedQuery.originalPrice.$lt = parseInt(parsedQuery.originalPrice.$lt)
		} else {
			parsedQuery.originalPrice = parseInt(parsedQuery.originalPrice)
		}
	}

	req.parsedQuery = parsedQuery

	next()
}

// createProduct
exports.createProduct = catchAsync(async (req, res, next) => {
	const productData = req.body

	productData.user = req.user.id

	const product = await Product.create(productData)
	const user = await User.findById(req.user.id)

	user.numProducts += 1
	await user.save()

	// subscribe to inapp notifications
	if (product) {
		const topicKey = product._id.toString()

		// get all subscribers
		const subs = await Subscription.find({ seller: product.user })

		const subscribers = subs.map((sub) => sub.user.toString())

		if (subscribers) {
			// create a topic
			await novu.topics.create({
				key: topicKey,
				name: product.title,
			})

			// add subscribers to topic
			await novu.topics.addSubscribers(topicKey, {
				subscribers,
			})

			const workFlow = "brokang-youtube"

			// send notification

			novu.trigger(workFlow, {
				to: [
					{
						type: "Topic",
						topicKey,
					},
				],
				payload: {
					title: product.title,
					productLink: `${process.env.FRONTEND_URL}/${product._id}`,
					storename: req.user.storename,
				},
			})
		}
	}

	res.status(201).json({
		success: true,
		product,
	})
})

// get all products
exports.getAllProducts = catchAsync(async (req, res, next) => {
	// Filtering products
	const { parsedQuery } = req

	let query = Product.find(parsedQuery)

	// Sorting
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ")
		query = query.sort(sortBy)
	} else {
		query = query.sort("-createdAt")
	}

	// Get product count before pagination
	const productCount = await Product.countDocuments(query)

	// Field limiting
	if (req.query.fields) {
		const fields = req.query.fields.split(",").join(" ")
		query = query.select(fields)
	}

	// Pagination
	const page = req.query.page * 1 || 1

	const limit = req.query.limit * 1 || 3

	const skip = limit * (page - 1)
	query = query.skip(skip).limit(limit)

	let totalPages

	if (req.query.page) {
		totalPages = Math.ceil(productCount / limit)
	}

	const products = await query

	const catArray = await Product.aggregate([
		{
			$match: parsedQuery || {},
		},
		{
			$group: {
				_id: "$category",
				count: { $sum: 1 },
			},
		},
		{
			$sort: { count: -1 },
		},
	])

	const statusArray = await Product.aggregate([
		{
			$match: parsedQuery || {},
		},
		{
			$group: {
				_id: "$status",
				count: { $sum: 1 },
			},
		},
		{
			$sort: { count: -1 },
		},
	])

	const brandArray = await Product.aggregate([
		{
			$group: {
				_id: "$brand",
				count: { $sum: 1 },
			},
		},

		{
			$sort: { count: -1 },
		},
	])

	res.status(200).json({
		success: true,
		productLength: products.length,
		productCount,
		totalPages,
		products,
		catArray,
		brandArray,
		statusArray,
	})
})

// get a single product
exports.getSingleProduct = catchAsync(async (req, res, next) => {
	const product = await Product.findById(req.params.productId).populate("user")

	if (!product) {
		return next(new AppError("This product is not available", 404))
	}

	res.status(200).json({
		success: true,
		product,
	})
})

// Update Single Product
exports.updateSingleProduct = catchAsync(async (req, res, next) => {
	const updatedItems = req.body
	const productId = req.params.productId

	const product = await Product.findOneAndUpdate(
		{ _id: productId },
		updatedItems,
		{ new: true }
	)

	res.status(200).json({
		success: true,
		product,
		message: "Product updated successfully",
	})
})

// update Many Products
exports.updateManyProduct = catchAsync(async (req, res, next) => {
	const { updatedItems } = req.body

	const updateOperation = updatedItems.map((item) => ({
		updateOne: {
			filter: { _id: item._id },
			update: { $set: item },
		},
	}))

	await Product.bulkWrite(updateOperation)
	res.status(200).json({
		success: true,
		message: "Products updated successfully",
	})
})

// delete image from cloudinary
exports.deleteImage = catchAsync(async (req, res, next) => {
	const { publicId } = req.body

	try {
		await cloudinary.uploader.destroy(publicId)
		res.status(201).json({
			success: true,
			message: "Image deleted successfully",
		})
	} catch (error) {
		res.status(400).json({
			success: false,
			error,
		})
	}
})
