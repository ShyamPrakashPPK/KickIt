const db = require('../config/connections');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const { ObjectId } = require('mongodb');
const { resolve } = require('node:path');
const paypal = require('paypal-rest-sdk');
const env= require('dotenv').config()



let instance = new Razorpay({
    key_id: process.env.razorpay_key_id,
    key_secret: process.env.razorpay_key_secret,
});


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.paypal_client_id,
    'client_secret': process.env.paypal_client_secret
})

module.exports = {

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                        SIGNUP                                           //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.userPassword = await bcrypt.hash(userData.userPassword, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((response) => {
                resolve(userData)
            })
        })
    },

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                        LOGIN                                            //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.userEmail })
            if (user.isblocked) {
                console.log("You have been blocked");
                resolve({ status: false })
            } else {
                if (user) {
                    bcrypt.compare(userData.Password, user.userPassword).then((status) => {
                        if (status) {
                            console.log("login sucess");
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            console.log("login failed");
                            resolve({ status: false })
                        }
                    })
                } else {
                    console.log("user not found");
                }
            }
        }
        )
    },

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                     OTP LOGIN                                           //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    otpLogin: (mobileNumber) => {
        console.log(mobileNumber);
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ userPhone: mobileNumber })
            resolve(user)
        })
    },

    //VERIFY MOBILE
    verifyMobile: (mobileNo) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ userPhone: mobileNo })
            if (user) {
                if (user.isblocked) resolve({ active: false })
                resolve({ status: true })
            }
            else {
                resolve({ status: false })
            }
        })
    },

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                          USERS                                          //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //ALL USERS
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let AllUsers = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(AllUsers)
        })
    },

    //USER DETAILS
    getUserDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let userDetails = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((response) => {
                resolve(response)
            })
        })
    },

    //DELETE USER
    deleteUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objectId(userId) }).then((response) => {
                resolve(response)
            })
        })
    },

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                      WISHLIST                                           //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    addToWishList: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) }) // check is user true or false is false user first adding to wish list
            if (userWishlist) {
                db.get().collection(collection.WISHLIST_COLLECTION)
                    .updateOne(
                        { user: objectId(userId) }, { $addToSet: { products: objectId(productId) } }
                    ).then(() => {
                        resolve()
                    }) //if user have a wish list update  or we add 
            } else {
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(
                    { user: objectId(userId), products: [objectId(productId)] }).then(() => {
                        resolve()
                    })
            }
        })
    },
    // GET WISHLIST 
    getWishList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlistProducts = await db.get().collection(collection.WISHLIST_COLLECTION)
                .aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: "$products"
                    },
                    {
                        $lookup: {
                            from: "product",
                            localField: "products",
                            foreignField: "_id",
                            as: "products"
                        }
                    },
                    {
                        $project: {
                            products: { $arrayElemAt: ['$products', 0] }
                        }
                    }
                ]).toArray()
            resolve(wishlistProducts)
        })
    },

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                          CART                                           //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    //CART PRODUCT LIST
    getCartProductsList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            resolve(cart.products)

        })
    },

    //ADD TO CART
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {

                                $push: { products: proObj }

                            }
                        ).then((response) => {
                            resolve()
                        })
                }

            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()

                })
            }
        })
    },
    //CART PRODUCTS
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: 1, productTotal: { $sum: { $multiply: ['$quantity', { $toInt: '$product.prodPrice' }] } }
                    }
                }

            ]).toArray()
            resolve(cartItems)
        })
    },

    //CART COUNT
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    //CHANGE PRODUCT QUANTITY
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })
            }
        })
    },
    //REMOVE FROM CART
    removeProduct: (details) => {  // we need cart id and product id to delete
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
        })
    },
    //TOTAL AMOUNT
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: 1, productTotal: { $sum: { $multiply: ['$quantity', { $toInt: '$product.prodPrice' }] } }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.prodPrice' }] } }
                    }
                },
            ]).toArray()
            resolve(total[0])
        })
    },

    //SUBTOTAL
    getSubtotal: (detail, USERid) => {
        return new Promise(async (resolve, reject) => {
            let subtotal = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(USERid) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {

                    $match: { item: ObjectId(detail.product) }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        _id: 0, quantity: 1, product: { $arrayElemAt: ["$product", 0] }

                    }
                },
                {
                    $project: {
                        subtotal: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$product.prodPrice' }] }
                    }
                }

            ]).toArray()
            resolve(subtotal[0])
        })
    },
    //DELETE FROM WISHLIST
    deleteWishList: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION)
                .updateOne({ _id: objectId(details.wishlistId) },
                    { $pull: { products: objectId(details.proId) } }).then((response) => {
                        resolve({ removeProduct: true })
                    })
        })
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                       CHECKOUT                                          //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    //ADDRESS
    userCheckoutAddress: (addressId, user) => {
        let addid = parseInt(addressId)
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            _id: ObjectId(user)
                        }
                    },
                    {
                        $unwind: '$Address'
                    },
                    {
                        $match: { 'Address.addressId': addid }
                    },
                    {
                        $project: {
                            Address: '$Address'
                        }
                    }
                ]).toArray()
            resolve(address[0])
        })
    },

    //ORDER PLACING
    placeOrder: (order, products, total, user, discounttt, subtotal) => {
        return new Promise(async (resolve, reject) => {
            let status = order['payment-method'] === 'COD' ? 'pending' : 'payed'
            let orderStatus = 'placed'
            let discount = parseInt(discounttt)
            let orderObj = {
                deliveryAddress: {
                    Name: order.Name,
                    HouseNo: order.HouseNo,
                    Street: order.Street,
                    TownCity: order.TownCity,
                    State: order.State,
                    Country: order.Country,
                    PostCode: order.PostCode,
                    Mobile: order.Mobile,
                },
                userId: objectId(user),
                paymentMethod: order['payment-method'],
                products: products,
                subtotal: subtotal,
                discount: discount,
                total: total,
                paymentstatus: status,
                orderStatus: orderStatus,
                date: new Date()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(user) })
                resolve(response.insertedId)
            })

        })



    },

    //RAZORPAY
    generateRazorpay: (orderId, total) => {
        var payTotal = parseInt(total.total);
        return new Promise(async (resolve, reject) => {

            var options = {
                amount: payTotal,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    resolve(order)
                }

            });
        })
    },

    //VERIFY PAYMENT FOR RAZORPAY
    verifyPayment: (details) => {
        return new Promise(async (resolve, reject) => {
            const { createHmac } = await import('node:crypto');
            let hmac = createHmac('sha256', '1I6LdzKS9k7xaJKnHMf0fG9b');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },

    //CHANGING PAYMENT STATUS 
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            status: 'payed'
                        }
                    }).then(() => {
                        resolve()
                    })
        })
    },
    createPay: (payment) => {
        return new Promise((resolve, reject) => {
            paypal.payment.create(payment, function (error, payment) {
                if (error) {
                    reject(error);
                } else {
                    console.log(payment);
                    resolve(payment)
                }
            });
        })
    },

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                        ORDERS                                           //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).sort({ 'date': -1 }).toArray()
            resolve(order)
        })
    },

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                     ADDRESS                                          //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    addNewAddress: (address, userId) => {
        return new Promise((resolve, reject) => {
            address.addressId = new Date().valueOf() // added new field as with date value for editing address
            db.get().collection(collection.USER_COLLECTION).updateOne(
                { _id: objectId(userId) },
                { $push: { Address: address } }
            )
            resolve()
        })
    },
    deleteAddress: (userId, addressId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION)
                .updateOne({ _id: objectId(userId) }, { $pull: { Address: { addressId: parseInt(addressId) } } })
            resolve()
        })
    },

    getSavedAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_COLLECTION)
                .aggregate([
                    {
                        $match: { _id: objectId(userId) }
                    },
                    {
                        $unwind: '$Address'
                    },
                    {
                        $project: {
                            _id: 0,
                            Address: '$Address'
                        }
                    }
                ]).toArray()
            resolve(address)
        })
    },

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                         COUPON                                          //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    //GET DISCOUNT
    getCouponDiscount: (couponCode) => {
        return new Promise(async (resolve, reject) => {
            let checkCoupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponCode: couponCode })
            if (checkCoupon === null) {
                checkCoupon = {}
                checkCoupon.err = "Invalid Coupon Code"
                checkCoupon.status = false
                resolve(checkCoupon)
            } else {
                let checkDate = await db.get().collection(collection.COUPON_COLLECTION)
                    .findOne({ _id: checkCoupon._id, expiryDate: { $gte: new Date() } })

                if (checkDate === null) {
                    checkDate = {}
                    checkDate.err = "Coupon Expired"
                    checkDate.status = false
                    resolve(checkDate)
                } else {
                    response = {}
                    response.status = true
                    response.coupon = checkDate
                    resolve(response)
                }

            }

        })
    },

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                         ORDER                                           //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    userOrderFull: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderdetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            resolve(orderdetails)
        })
    },
    userOrderDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderedProducts = await db.get().collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: { _id: objectId(orderId) }
                    },
                    {
                        $unwind: "$products"
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: 'product',
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }

                ]).toArray()
            resolve(orderedProducts)
        })
    },

    //CANCEL ORDER
    cancelOrder: (orderId, user) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            if (order.paymentMethod != "COD") {
                user.wallet = user.wallet + parseInt(order.total)
                let wallet = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(order.userId) },
                    {
                        $set: { wallet: user.wallet }
                    })
            }
            db.get().collection(collection.ORDER_COLLECTION).
                updateOne({ _id: objectId(orderId) },
                    {
                        $set: { orderStatus: 'Cancelled' }
                    }).then((response) => {
                        resolve(response)
                    })
        })
    },

    //RETURN ORDER
    returnOrder: (id, user) => {
        let ID = id.orderId
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(ID) })
            if (order.paymentMethod != "COD") {
                user.wallet = user.wallet + parseInt(order.total)
                let wallet = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(order.userId) },
                    {
                        $set: { wallet: user.wallet }
                    })
            }
            db.get().collection(collection.ORDER_COLLECTION).
                updateOne({ _id: objectId(id.orderId) },
                    {
                        $set: { orderStatus: 'Return' }
                    }).then((response) => {
                        resolve(response)
                    })
        })
    },

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                          WALLET                                         //                    
    /////////////////////////////////////////////////////////////////////////////////////////////


    setWalletHistory: async (user, order, description) => {
        let OrderDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(order) })
        return new Promise(async (resolve, reject) => {
            let walletDetails;
            walletDetails = {
                date: new Date().toDateString(),
                orderId: order,
                amount: OrderDetails.total,
                description: description,
                credit: true
            };
            let userData = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(user._id) })
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(user._id) },
                {
                    $push: { walletHistory: walletDetails }
                }).then((response) => {
                    resolve(response)
                })
        })
    },

    getUserWallet: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(id) }, { wallet: 1 }).then((data) => {
                resolve(data)
            })
        })
    },
    disWalletHistory: (user) => {
        return new Promise(async (resolve, reject) => {
            let history = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(user) }
                },
                {
                    $unwind: "$walletHistory"
                }, {
                    $project: { _id: 0, walletHistory: 1 }
                }
            ]).toArray()
            resolve(history)
        })
    },

  

}