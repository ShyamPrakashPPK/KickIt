const db = require('../config/connections')
const collection = require('../config/collections')
const { ObjectId } = require('mongodb')
const { response } = require('../app')
const collections = require('../config/collections')
var objectId = require('mongodb').ObjectId

module.exports = {

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                       DASHBOARD                                         //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    getAllOrderCount: () => {
        return new Promise((resolve, reject) => {
            let count = db.get().collection(collection.ORDER_COLLECTION)
                .find().count()
            resolve(count)
        })
    },
    getTotalRevenue: () => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $group: {
                            _id: "",
                            "Total": { $sum: "$totalAmount" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            "TotalAmount": '$Total'
                        }
                    }
                ]).toArray()
            resolve(total)
            console.log(total, "showing total from helpers8888888888888888888888888888888888888888888")

        })
    },
    totalUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = db.get().collection(collection.USER_COLLECTION)
                .find().count()
            resolve(users)
        })
    },
    getPaymentMethods: () => {
        return new Promise(async (resolve, reject) => {
            const CODCount = await db.get()?.collection(collection.ORDER_COLLECTION).find({ paymentMethod: "COD" }).count()
            const PayPalCount = await db.get()?.collection(collection.ORDER_COLLECTION).find({ paymentMethod: "PAYPAL" }).count()
            const OnlineCount = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: "ONLINE" }).count()

            const count = {}

            count.CODCount = CODCount
            count.PaypalCount = PayPalCount
            count.OnlineCount = OnlineCount

            resolve(count)
        })
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                             ORDERS                                      //                    
    /////////////////////////////////////////////////////////////////////////////////////////////    
    getCompleteOrders: () => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ 'date': -1 }).toArray()
            console.log(order, '-----------------');
            resolve(order)
        })
    },

    //-------------get complete details--------------------
    getOrderCompleteDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            resolve(order)
        })
    },
    changeDeliveryStatus: (orderID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .update(
                    { _id: objectId(changes.orderId), 'cartDetails.item': objectId(changes.proId) },
                    {
                        $set: { 'cartDetails.$.status': changes.status }
                    })
                .then((response) => {
                    resolve()
                })
        })
    },
    //--------------------------To get order products----------------------------
    getOrderDetails: (orderId) => {
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

    updateDeliveryStatus: (order) => {
        console.log(order,);
        let orderId = order.order
        let Newstatus = order.status

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).
                updateOne({ _id: objectId(orderId) },
                    {
                        $set: { orderStatus: Newstatus }
                    }).then((response) => {
                        resolve(response)
                    })

        })
    },



    

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                             USER                                        //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //------------------------------to block a user-------------------------------------
    blockUser: (blockUserId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(blockUserId) },
                {
                    $set: { isblocked: true }
                })
        }).then((response) => {
            resolve()
        })
    },
    //-----------------------------To unblock a user----------------------------------
    unblockUser: (unblockUserId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(unblockUserId) },
                {
                    $set: { isblocked: false }
                })
        }).then((response) => {
            resolve()
        })
    },

    

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                             CATEGORY                                    //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //-------------------------------to block a category----------------------------------
    blockCategory: (BlockCategoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(BlockCategoryId) },
                {
                    $set: { categoryBlocked: true }
                })
        })
    },
    //----------------------------------------to unblock a category------------------------------
    unblockCategory: (unblockCategoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(unblockCategoryId) },
                {
                    $set: { categoryBlocked: false }
                })
        })
    },

    

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                             BRAND                                       //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //-------------------------------------block brand-------------------------
    blockBrand: (BlockBrandId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).updateOne({ _id: ObjectId(BlockBrandId) },
                {
                    $set: { brandBlocked: true }
                })
        })
    },
    //-----------------------------to unblock brand--------------------------
    unblockBrand: (unblockBrandId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).updateOne({ _id: ObjectId(unblockBrandId) },
                {
                    $set: { brandBlocked: false }
                })
        })
    },

    

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                           COUPON                                        //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //-----add-coupon---
    addCoupon: (CouponDetails) => {
        CouponDetails.couponDiscount = parseInt(CouponDetails.couponDiscount)
        CouponDetails.maxAmount = parseInt(CouponDetails.maxAmount)
        CouponDetails.minSpend = parseInt(CouponDetails.minSpend)
        CouponDetails.expiryDate = new Date(CouponDetails.expiryDate)
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponCode: CouponDetails.couponCode })
            if (coupon) {
                resolve({ status: false })
            } else {
                let add = await db.get().collection(collection.COUPON_COLLECTION).insertOne(CouponDetails)
                resolve({ status: true })
            }
        })
    },
    //----view-coupon-----
    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().sort({ 'date': -1 }).toArray()
            resolve(coupon)
        })
    },
    blockCoupon: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).updateOne({ _id: ObjectId(id) },
                {
                    $set: { couponBlocked: true }
                })
        })
    },
    unBlockCoupon: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).updateOne({ _id: ObjectId(id) },
                {
                    $set: { couponBlocked: false }
                })
        })
    },
    updateCoupon: (CouponDetails) => {
        console.log("inside the helper");
        console.log(CouponDetails);

        return new Promise(async (resolve, reject) => {
            let update = await db.get().collection(collection.COUPON_COLLECTION)
                .updateOne(
                    { _id: objectId(CouponDetails.id) },
                    {
                        $set: {
                            couponCode: CouponDetails.couponCode,
                            couponDescription: CouponDetails.couponDescription,
                            couponDiscount: parseInt(CouponDetails.couponDiscount),
                            maxAmount: parseInt(CouponDetails.maxAmount),
                            minSpend: parseInt(CouponDetails.minSpend),
                            expiryDate: new Date(CouponDetails.expiryDate)
                        }
                    }
                )
            resolve({ status: true })

        })
    },
    deleteCoupon: (couponId) => {
        console.log("insoide the helper", couponId.offerId);
        return new Promise(async (resolve, reject) => {
            let deleteCoupon = await db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: objectId(couponId.offerId) })
            resolve()
        })

    },

    
    //-------coupon management--------------------------------------//
    getActiveCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let activeCoupons = await db.get().collection(collection.COUPON_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            expiryDate: { $gte: new Date() }

                        }
                    },
                    {
                        $project:
                        {

                            expiryDate: { $dateToString: { format: "%d-%m-%Y ", date: "$expiryDate" } },
                            couponCode: 1,
                            maxAmount: 1,
                            minSpend: 1,
                            couponDescription: 1,
                            couponDiscount: 1

                        }
                    }
                ]).toArray()
            console.log(activeCoupons, "Active Coupons-----------");
            resolve(activeCoupons)
        })
    },
    getExpiredCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let expiredCoupons = await db.get().collection(collection.COUPON_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            expiryDate: { $lt: new Date() }

                        }
                    },
                    {
                        $project:
                        {
                            expiryDate: { $dateToString: { format: "%Y-%m-%d ", date: "$expiryDate" } },
                            couponCode: 1,
                            maxAmount: 1,
                            minSpend: 1,
                            couponDescription: 1,
                            couponDiscount: 1
                        }
                    }
                ]).toArray()
            console.log(expiredCoupons, "Expired");
            resolve(expiredCoupons)
        })
    },
    // getSalesReport: () => {
    //     return new Promise(async (resolve, reject) => {
    //         let salesReport = await db.get().collection(collection.ORDER_COLLECTION)
    //             .aggregate([
    //                 {
    //                     $project: {
    //                         _id: 0,
    //                         cartdetails: 1
    //                     }
    //                 },
    //                 {
    //                     $unwind: '$products'
    //                 },
    //                 {
    //                     $lookup: {
    //                         from: collection.PRODUCT_COLLECTION,
    //                         localField: 'item',
    //                         foreignField: '_id',
    //                         as: 'product'
    //                     }
    //                 }
    //             ]).toArray()
    //         console.log(salesReport, "<-------------sales report here");
    //         resolve(salesReport)
    //     })
    // },

    

    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                      SALES REPORT                                       //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    getSalesReport: () => {
        return new Promise(async (resolve, reject) => {
             salesReport = await db.get().collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {   
                        $project: {
                            _id: 0,
                            products: 1
                        }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            quantity: '$products.quantity',
                            productTotal: '$products.productTotal',   //product total-- quanity* 
                            item: "$products.product.prodName",
                            productPrice: { $toInt: '$products.product.prodPrice' },
                            profit: { $subtract: ["$productTotal", { $multiply: ['$quantity', '$productPrice' ] }] }
                        }
                    },
                    {
                        $addFields: {
                            profit: { $subtract: ["$productTotal", { $multiply: ['$quantity', '$productPrice'] }] }
                        }
                    },
                    {
                        $group: {
                            _id: '$item',
                            SalesQty: { $sum: '$quantity' },
                            Revenue: { $sum: '$productTotal' },
                            profit: { $sum: '$profit' }
                        }
                    }
                ]).toArray()
                console.log(salesReport,"sales report00000000000000");
            resolve(salesReport)
        })
    },
}
