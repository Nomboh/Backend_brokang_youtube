const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema(
	{
		conversationId: String,
		senderId: String,
		image: String,
		text: String,
	},
	{
		timestamps: true,
	}
)

const Message = mongoose.model("Message", messageSchema)
module.exports = Message
