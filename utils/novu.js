const { Novu } = require("@novu/node")
require("dotenv").config()

const novu = new Novu(process.env.NOVU_KEY)

module.exports = novu
