const express = require("express")
const { isAuthenticated } = require("../middleware/auth")
const {
	createProduct,
	getAllProducts,
	getSingleProduct,
	updateSingleProduct,
	deleteImage,
	getSellerOtherItems,
	getCategories,
} = require("../controller/productController")

const router = express.Router()
router.route("/").post(isAuthenticated, createProduct)
router.route("/").get(isAuthenticated, getAllProducts)
router
	.route("/seller-other-items/:userId")
	.get(isAuthenticated, getSellerOtherItems, getAllProducts)

router
	.route("/recommended/:category")
	.get(isAuthenticated, getCategories, getAllProducts)
router.route("/:productId").get(isAuthenticated, getSingleProduct)
router.route("/:productId").put(isAuthenticated, updateSingleProduct)
router.route("/deleteImage").post(isAuthenticated, deleteImage)

module.exports = router
