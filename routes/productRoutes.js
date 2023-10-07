const express = require("express")
const { isAuthenticated } = require("../middleware/auth")
const {
	createProduct,
	getAllProducts,
	getSingleProduct,
	updateSingleProduct,
	deleteImage,
} = require("../controller/productController")

const router = express.Router()
router.route("/").post(isAuthenticated, createProduct)
router.route("/").get(isAuthenticated, getAllProducts)
router.route("/:productId").get(isAuthenticated, getSingleProduct)
router.route("/:productId").put(isAuthenticated, updateSingleProduct)
router.route("/deleteImage").post(isAuthenticated, deleteImage)

module.exports = router
