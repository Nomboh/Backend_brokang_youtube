const Order = require("../model/orderModel")
const Product = require("../model/productModel")
const User = require("../model/userModel")
const catchAsync = require("../utils/catchAsync")

// create an order
exports.createOrder = catchAsync(async (req, res, next) => {
	const { totalPrice, shippingAddress, paymentInfo, product } = req.body

	const productToOrder = await Product.findById(product)
	const sellerAcc = await User.findById(productToOrder.user)

	const order = await Order.create({
		totalPrice,
		shippingAddress,
		paymentInfo,
		product,
		seller: productToOrder.user,
		user: req.user.id,
	})

	productToOrder.status = "under reservation"
	await productToOrder.save()

	sellerAcc.accountBalance += parseFloat((totalPrice * 0.98).toFixed(2))
	await sellerAcc.save()
	res.status(201).json({
		success: true,
		order,
	})
})

// get users Order
exports.getUserOrder = catchAsync(async (req, res, next) => {
	const orders = await Order.find({ user: req.user.id })

	res.status(200).json({
		success: true,
		orders,
	})
})

// get an order
exports.getOrder = catchAsync(async (req, res, next) => {
	const order = await Order.findById(req.params.id).populate(
		"product",
		"title images user status"
	)

	res.status(200).json({
		success: true,
		order,
	})
})

// get seller orders
exports.getSellerOrders = catchAsync(async (req, res, next) => {
	const orders = await Order.find({ seller: req.user.id }).populate("product")

	res.status(200).json({
		success: true,
		orders,
	})
})

// update order status
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
	const { status } = req.body

	const order = await Order.findById(req.params.id)

	const sellerAcc = await User.findById(order.seller)
	const orderProduct = await Product.findById(order.product)

	order.status = status
	order.deliveredAt = Date.now()
	await order.save()

	sellerAcc.availableBalance += parseFloat((order.totalPrice * 0.98).toFixed(2))
	await sellerAcc.save()

	orderProduct.status = "sold out"
	await orderProduct.save()

	res.status(200).json({
		success: true,
		order,
	})
})
