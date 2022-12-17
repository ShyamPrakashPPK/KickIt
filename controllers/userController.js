const express = require('express');
const { response } = require('../app');
const router = express.Router();
const userHelper = require('../helpers/user-helpers');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const OTP = require('../helpers/otp-helpers');
const otpHelpers = require('../helpers/otp-helpers');
const bannerHelpers = require('../helpers/banner-helpers');
const paypal = require('paypal-rest-sdk');
const categoryHelpers = require('../helpers/category-helpers');
const brandHelpers = require('../helpers/brand-helpers');
const env = require('dotenv').config()

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.paypal_client_id,
    'client_secret': process.env.paypal_client_secret
});

module.exports = {

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                  VERIFY LOGIN                                           //                    
    /////////////////////////////////////////////////////////////////////////////////////////////


    verifyLogin: (req, res, next) => {
        if (req.session.loginStatus) {
            next()
        } else {
            res.redirect('/login')
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                   SIGN UP                                               //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    // TO RENDER THE PAGE
    getUserSignUp: (req, res, next) => {
        res.render('users/signup', { layout: 'layout' });
    },
    //POST METHOD FUNCTION
    postUserSignUp: (req, res) => {
        userHelpers.doSignup(req.body).then((response) => {
            req.session.user = response
            req.session.loginStatus = true
            res.redirect('/')
        })
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                     LOGIN                                               //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    // TO RENDER THE LOGIN PAGE
    getUserLogin: (req, res) => {
        if (req.session.loginStatus) {
            res.redirect('/')
        } else {
            req.session.loginErr = "Invalid username or password"
            res.render('users/login', { ERROR: req.session.loginErr })
            req.session.loginErr = false
        }
    },

    //POST METHOD FUNCTION
    postUserLogin: (req, res) => {
        userHelpers.doLogin(req.body).then((response) => {
            if (response.status) {
                req.session.loginStatus = true
                req.session.user = response.user
                res.redirect('/')
            }
            else {
                req.session.loginErr = "Invalid username or password"
                res.render('users/login', { ERROR: req.session.loginErr })
                res.redirect('/login')
            }
        })
    },



    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                         OTP                                             //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    //OTP ENTER PHONE RENDER PAGE
    otpPhone: (req, res) => {
        res.render('users/otp-phone')
        req.session.mobileError = null;
    },

    //OTP ENTER(VERIDIES PHONE NUMBER)
    postOtpPhone: (req, res) => {
        let phone = req.body.phone
        userHelpers.verifyMobile(req.body.phone).then((response) => {
            if (response.status) {
                req.session.mobileNumber = req.body.phone
                mobile = `+91${req.body.phone}`
                // otpHelpers.sendOTP(mobile)
                res.render('users/otp-login')
            } else {
                res.redirect('/otp-phone')
            }
        })
    },

    //OTP VERIFY FUNCTION
    postOTPverify: (req, res) => {
        let number = (req.body.one + req.body.two + req.body.three + req.body.four + req.body.five + req.body.six)
        let OTP = (number)
        otpHelpers.verifyOTP(OTP).then(async (response) => {
            if (response.status) {
                console.log('verify sucessful✅✅✅✅✅✅✅✅✅✅✅');
                mobileNumber = req.session.mobileNumber
                req.session.mobileNumber = null
                req.session.loginStatus = true
                req.session.user = await userHelper.otpLogin(mobileNumber)
                res.redirect('/')
            } else {
                res.session.otpError = "Invalid OTP";
                console.log('verify failed⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔');
                res.redirect('/');
            }
        })
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                       LOGOUT                                            //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    userLogout: (req, res) => {
        req.session.loginStatus = false
        req.session.user = null
        res.redirect('/')
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                       INDEX                                             //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    userIndex: async (req, res) => {
        let user = req.session.user
        let cartCount = null
        if (req.session.user) {
            cartCount = await userHelpers.getCartCount(req.session.user._id)
        }
        let mens = await productHelpers.getcategoryMen()
        let women = await productHelpers.getcategoryWomen()
        let kids = await productHelpers.getcategoryKids()
        let brand = await brandHelpers.getAllBrands()
        let oldprod= await productHelpers.getoldProducts()
        let showcasetwo= await bannerHelpers.getbestseller()
        productHelpers.getAllProducts().then((product) => {
            bannerHelpers.getIndexBanner().then((banner) => {
                bannerHelpers.getShowcase().then((showcase) => {
                    res.render('users/index', { brand, mens, women, kids, showcasetwo,showcase, oldprod, product, user, banner, cartCount, layout: 'layout' });
                })
            })
        })
    },


    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                        SEARCH                                           //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    searchBar: async (req, res) => {
        let response = await productHelpers.getProductsBySearch(req.query.searchKey)
        res.json(response)
    },

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                   SHOP / LIST/ GRID                                     //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    userShopList: async (req, res) => {
        let categories = await categoryHelpers.getAllCategory()
        productHelpers.getAllProducts().then((product) => {
            res.render('users/shop-list', { product, categories, user: req.session.user })
        })
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                  PRODUCT SINGLE VIEW                                    //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    userSingleProduct: async (req, res, next) => {
        let singleproid = req.query.id
        let allproducts = await productHelpers.getAllProducts()
        productHelpers.getSingleProduct(singleproid).then((product) => {
            res.render('users/single', { product, allproducts, user: req.session.user, layout: 'layout' })
        })
    },
    

    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                   CONTACT US                                            //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    getcontactUs: (req, res) => {
        res.render('users/contact', { layout: 'layout' })
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                   ABOUT US                                              //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    getAboutUs: (req, res) => {
        res.render('users/about', { layout: 'layout' })
    },


    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                   WISHLIST                                              //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    //RENDER WISHLIST PAGE
    getWishlist: async (req, res) => {
        let userId = req.session.user._id
        let product = await userHelpers.getWishList(userId)
        res.render("users/wishlist", { product, user: req.session.user })
    },

    //ADD TO WISHLIST
    addToWishlist: (req, res) => {
        let id = req.params.id
        let userId = req.session.user._id
        userHelpers.addToWishList(id, userId).then(() => {
            res.json({ status: true })
        })
    },

    //REMOVE FROM WISHLIST
    removeFromWishlist: async (req, res, next) => {
        if (req.session.user == null) {
            res.json({ status: false })
        } else {
            userHelpers.deleteWishList(req.body).then(async (response) => {
                res.json({ status: true })
            })
        }
    },

    //ADD TO CART FROM WISH LIST
    wishlistToCart: async (req, res, next) => {
        let proId = req.body.proId
        if (req.session.user == null) {
            res.json({ status: false })
        } else {
            userHelpers.addToCart(proId, req.session.user._id).then(async () => {
                userHelpers.deleteWishList(req.body).then(async (response) => {
                    res.json({ status: true })
                })
            })
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                       CART                                              //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    //RENDER CART PAGE
    getUserCart: async (req, res) => {
        let products = await userHelpers.getCartProducts(req.session.user._id)
        let totalValue = 0
        if (products.length > 0) {
            totalValue = await userHelpers.getTotalAmount(req.session.user._id)
        }
        res.render('users/cart', { products, totalValue, user: req.session.user.loggedIn, user: true })
    },

    //ADD TO CART
    userAddToCart: (req, res) => {
        if (req.session.user == null) {
            res.json({ status: truefalse })
        } else {
            userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
                res.json({ status: true })
            })
        }
    },

    //CHANGE PRODUCT QUANTITY
    postChangeProdQuantity: async (req, res, next) => {
        let user = req.session.user._id
        let cart = await userHelpers.getCartProducts(user)
        let total = cart.productTotal
        userHelpers.changeProductQuantity(req.body).then(async (response) => {
            response.total = await userHelpers.getTotalAmount(req.session.user._id)
            response.subtotal = await userHelpers.getSubtotal(req.body, user)
            res.json(response)
        })
    },

    //REMOVE PRODUCT FROM CART
    removeCartProduct: (req, res, next) => {
        userHelpers.removeProduct(req.body).then(async (response) => {
            res.json(response)
        })
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                     CHECKOUT                                            //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    //RENDER THE CHECKOUT PAGE
    getCheckout: async (req, res) => {
        let product = await userHelpers.getCartProducts(req.session.user._id)
        let address = await userHelpers.getSavedAddress(req.session.user._id)
        let total = await userHelpers.getTotalAmount(req.session.user._id)
        let total2 = parseInt(total.total)
        let user = req.session.user
        res.render('users/checkout', { total2, user, address, product })
    },

    //CHECKOUT ADDDRESS AJAX CALL
    getCheckoutAddress: async (req, res) => {
        let addressId = req.body.id;
        let userId = req.session.user._id
        let address = await userHelpers.userCheckoutAddress(addressId, userId)
        res.json({ address })

    },

    //APPLY COUPON FOR DISCOUNT
    applyCouponDiscount: async (req, res, next) => {
        let getCouponDiscount = await userHelpers.getCouponDiscount(req.params.couponCode)
        res.json(getCouponDiscount)
    },

    //PLACE ORDER
    postPlaceOrder: async (req, res) => {
        let user = req.session.user._id
        let products = await userHelpers.getCartProducts(user)
        let totalPrice = await userHelper.getTotalAmount(user)
        let discount = req.body.couponApplied
        let subtotal = totalPrice.total
        let total = subtotal - discount
        userHelpers.placeOrder(req.body, products, total, user, discount, subtotal).then((orderid) => {
            if (req.body['payment-method'] === 'COD') {
                res.json({ codSuccess: true })
            } else if (req.body['payment-method'] == "ONLINE") {
                userHelpers.generateRazorpay(orderid, totalPrice).then((response) => {
                    response.razor = true
                    res.json(response)
                })
            } else if (req.body['payment-method'] == "PAYPAL") {
                let payment = {
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        "return_url": "http://localhost:3000/my-orders",
                        "cancel_url": "http://localhost:3000/my"
                    },
                    "transactions": [{
                        "item_list": {
                            "items": [{
                                "name": "item",
                                "sku": "item",
                                "price": total,
                                "currency": "USD",
                                "quantity": 1
                            }]
                        },
                        "amount": {
                            "currency": "USD",
                            "total": total
                        },
                        "description": "This is the payment description."
                    }]
                };
                userHelpers.createPay(payment).then((transaction) => {
                    var id = transaction.id;
                    var links = transaction.links;
                    var counter = links.length;
                    while (counter--) {
                        if (links[counter].rel == 'approval_url') {
                            transaction.payPal = true
                            transaction.linkto = links[counter].href
                            transaction.orderId = orderid
                            res.json(transaction)
                        }
                    }
                })
                    .catch((err) => {
                        console.log(err);
                        res.redirect('/err');
                    });
            }
        })
    },


    //REDIRECTED ORDER PAGE
    viewOrders: async (req, res) => {
        let orders = await userHelpers.getUserOrders(req.session.user._id)
        orders.forEach(orders => {
            orders.date = orders.date.toString().substr(4, 17)
        });
        res.render('users/my-orders', { user: req.session.user, orders })
    },

    //ORDER SUCESS PAGE
    orderSuccess: (req, res) => {
        res.render('users/order-success', { user: req.session.user })
    },

    //VIEW ALL ORDERED PRODUCTS
    viewOrderdProducts: async (req, res) => {
        let orderid = req.query.id
        let order = await userHelpers.getAllOrders(orderid)
        res.render('users/view-ordered-product', { user: req.session.user, order, layout: 'layout' })
    },
    
    //VERIFY PAYMENT
    verifyPayment: (req, res) => {
        userHelpers.verifyPayment(req.body).then(() => {
            userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
                res.json({ status: true })
            })
        }).catch((err) => {
            res.json({ status: false, errMsg: 'failed' })
        })
    },
   
    
    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                   USER ACCOUNT                                          //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    //RENDER USER ACCOUNT
    userAccount: async (req, res) => {
        let id = req.session.user._id
        let userDetails = await userHelper.getUserDetails(id)
        let wallet = await userHelpers.getUserWallet(id)
        let walletHistory = await userHelpers.disWalletHistory(id)
        let orders = await userHelpers.getUserOrders(id)
        orders.forEach(orders => {
            orders.date = orders.date.toString().substr(4, 17)
        });
        let address = await userHelpers.getSavedAddress(id)
        res.render('users/my-account', { user: req.session.user, orders, wallet, walletHistory, address, userDetails })
    },

    //ADD NEW ADDRESS RENDER PAGE
    addNewAddress: (req, res) => {
        res.render('users/addAddress')
    },

    //POST METHOD FOR ADDRESS
    postNewAddress: async (req, res, next) => {
        let address = req.body
        let add = await userHelpers.addNewAddress(address, req.session.user._id)
        res.redirect('/my-account')
    },

    //DELETE ADDRESS
    deleteAddress: async (req, res) => {
        let user = req.session.user._id
        let address = req.Address.addressId
        let deleteOne = await userHelpers.deleteAddress(user, address)
        res.redirect('/my-account#address-edit')

    },

    //ORDER DETAILS PAGE
    userOrderDetails: async (req, res) => {
        let orderid = req.query.id
        let userOrder = await userHelpers.userOrderDetails(orderid)
        let fullOrder = await userHelper.userOrderFull(orderid)
        res.render('users/order-details', { layout: 'layout', user: req.session.user, fullOrder, userOrder })
    },

    //CANCEL ORDER
    userCancelOrder: async (req, res) => {
        let orderId = req.body.orderId
        let user = req.session.user
        let description = "Order Cancelled"
        await userHelpers.setWalletHistory(user, orderId, description)
        userHelpers.cancelOrder(orderId, user).then((response) => {
            res.json({ status: true })
        })
    },

    //RETURN ORDER
    userReturnOrder: async (req, res) => {
        let orderId = req.body
        let user = req.session.user
        let walletorder = req.body.orderId
        let description = "Order Cancelled"
        await userHelpers.setWalletHistory(user, walletorder, description)
        userHelpers.returnOrder(orderId, user).then((response) => {
            res.json({ status: true })
        })
    },

    //GET INVOICE
    getInvoice: async (req, res) => {
        let id = req.query.id
        let userOrder = await userHelpers.userOrderDetails(id)
        let fullOrder = await userHelper.userOrderFull(id)
        res.render('users/invoice', { layout: 'layout', user: req.session.user, fullOrder, userOrder })
    }

}


