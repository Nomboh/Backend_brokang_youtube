const express = require("express")
const dotenv = require("dotenv")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const AppError = require("./utils/AppError")
const GlobalErrorHandler = require("./controller/errorController")

const userRouter = require("./routes/userRoutes")
const productRouter = require("./routes/productRoutes")
const followRouter = require("./routes/followerRoutes")
const subscriptionRouter = require("./routes/subscriptionRoutes")
const orderRoutes = require("./routes/orderRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const likeRoutes = require("./routes/likeRoutes")
const conversationRoutes = require("./routes/conversationRoutes")
const messageRoutes = require("./routes/messageRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const withdrawalRoutes = require("./routes/withdrawalRoute")

dotenv.config()

const app = express()

app.use(
	cors({
		origin: [`https://brokang-youtube-frontend.vercel.app/`],
		credentials: true,
	})
)
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }))

app.get("/test", (req, res) => {
	res.status(200).send("hello welcome to brokang market")
})

app.use("/api/v1/user", userRouter)
app.use("/api/v1/product", productRouter)
app.use("/api/v1/follow", followRouter)
app.use("/api/v1/subscription", subscriptionRouter)
app.use("/api/v1/order", orderRoutes)
app.use("/api/v1/review", reviewRoutes)
app.use("/api/v1/like", likeRoutes)
app.use("/api/v1/conversation", conversationRoutes)
app.use("/api/v1/message", messageRoutes)
app.use("/api/v1/payment", paymentRoutes)
app.use("/api/v1/withdrawal", withdrawalRoutes)

app.all("*", (req, res, next) => {
	next(
		new AppError(
			`The route you are trying to access is not defined ${req.originalUrl}`,
			400
		)
	)
})

app.use(GlobalErrorHandler)

module.exports = app
