const Conversation = require("../model/conversationModel")
const catchAsync = require("../utils/catchAsync")

// create conversation
exports.createConversation = catchAsync(async (req, res, next) => {
	const { sellerId, userId } = req.body

	let conversation = await Conversation.findOne({
		members: { $all: [sellerId, userId] },
	})

	if (conversation) {
		res.status(200).json({
			success: true,
			conversation,
		})
	} else {
		conversation = await Conversation.create({
			members: [sellerId, userId],
		})

		res.status(201).json({
			success: true,
			conversation,
		})
	}
})

// get user conversations
exports.getUserConversations = catchAsync(async (req, res, next) => {
	const conversations = await Conversation.find({
		members: { $in: req.user.id },
	})
		.sort({ updatedAt: -1, createdAt: -1 })
		.populate("members", "name storename photo")

	res.status(200).json({
		success: true,
		conversations,
	})
})

// get current conversations
exports.getCurrentConversations = catchAsync(async (req, res, next) => {
	const conversation = await Conversation.findById(req.params.id).populate(
		"members",
		"name storename photo numProducts"
	)

	res.status(200).json({
		success: true,
		conversation,
	})
})
