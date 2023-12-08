const express = require("express")
const { isAuthenticated } = require("../middleware/auth")
const {
	createProduct,
	getAllProducts,
	getSingleProduct,
	updateSingleProduct,
	deleteImage,
	getSellerOtherItems,
	getRecommendedProducts,
	productFilters,
	updateManyProduct,
} = require("../controller/productController")

const router = express.Router()
router.route("/").post(isAuthenticated, createProduct)
router.route("/").get(productFilters, getAllProducts)
router
	.route("/seller-other-items/:userId")
	.get(isAuthenticated, getSellerOtherItems, productFilters, getAllProducts)

router
	.route("/recommended/:category")
	.get(isAuthenticated, getRecommendedProducts, productFilters, getAllProducts)
router.route("/:productId").get(getSingleProduct)
router.route("/:productId").put(isAuthenticated, updateSingleProduct)
router.route("/update/manyProducts").put(isAuthenticated, updateManyProduct)
router.route("/deleteImage").post(isAuthenticated, deleteImage)

module.exports = router
