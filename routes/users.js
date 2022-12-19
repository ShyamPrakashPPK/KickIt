var express = require('express');
var router = express.Router();
const { verifyLogin, userIndex, userShopList, userSingleProduct, getUserSignUp, postUserSignUp, getUserLogin, userShopListByCategory
  , postUserLogin, userLogout, getUserCart, getWishlist, deleteAddress, postNewAddress, userAccount, addNewAddress, searchBar,
  postOtpPhone, verifyPayment, userCancelOrder, userOrderDetails, userReturnOrder, getCheckoutAddress, addToWishlist,
  postOTPverify, userAddToCart, otpPhone, postChangeProdQuantity, removeFromWishlist, getCheckout, wishlistToCart, getInvoice,
  postPlaceOrder, viewOrders, getAboutUs, orderSuccess, removeCartProduct, getcontactUs, viewOrderdProducts, applyCouponDiscount } = require('../controllers/userController');



//--main pages----
router.get('/', userIndex)
router.get('/shop-list', userShopList)
router.get('/shop-listt/:id', userShopListByCategory)
router.get('/single/', userSingleProduct)
router.get('/contact', getcontactUs)
router.get('/about', getAboutUs)
router.get('/getSearch', searchBar)


//-----signUp and Login-----
router.get('/signup', getUserSignUp)
router.post('/signup', postUserSignUp)
router.get('/login', getUserLogin)
router.post('/login', postUserLogin)
router.get('/otp-phone', otpPhone)
router.post('/otp-phone', postOtpPhone)
router.post('/otp-login', postOTPverify)                                                                                                                                         // 
router.get('/logout', userLogout)

//-----cart-----
router.get('/cart', verifyLogin, getUserCart)
router.get('/add-to-cart/:id', verifyLogin, userAddToCart)
router.post('/changeProductQuantity', postChangeProdQuantity)
router.post('/removeProduct', verifyLogin, removeCartProduct)

//-----wishlist-----
router.get('/wishlist', verifyLogin, getWishlist)
router.get('/add-to-wishlist/:id', verifyLogin, addToWishlist)
router.post('/removeWishlist', verifyLogin, removeFromWishlist)
router.post('/addToCartWishlist', verifyLogin, wishlistToCart)

//-----Checkout----
router.get('/checkout', verifyLogin, getCheckout)
router.post('/get-address', verifyLogin, getCheckoutAddress)
router.post('/get-coupon-discount/:couponCode', verifyLogin, applyCouponDiscount)
router.post('/place-order', verifyLogin, postPlaceOrder)
router.get('/order-success', verifyLogin, orderSuccess)
router.post('/verify-payment', verifyPayment)

//-----orders
router.get('/my-orders', verifyLogin, viewOrders)
router.get('/view-ordered-product/', verifyLogin, viewOrderdProducts)

//-----Account-----
router.get('/my-account', verifyLogin, userAccount)

//-----Address-----
router.get('/add-address', verifyLogin, addNewAddress)
router.post('/postAddress', verifyLogin, postNewAddress)
router.get('/removeAddress/:id', verifyLogin, deleteAddress)

//-----Order-----
router.get('/order-details/', verifyLogin, userOrderDetails)
router.post('/cancelOrder', verifyLogin, userCancelOrder)
router.post('/returnOrder', verifyLogin, userReturnOrder)
router.get('/invoice', verifyLogin, getInvoice)



module.exports = router;



