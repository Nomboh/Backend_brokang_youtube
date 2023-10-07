const mongoose = require("mongoose")

const followsSchema = new mongoose.Schema({
	follower: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},

	followee: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
})

const Followers = mongoose.model("Follower", followsSchema)
module.exports = Followers
