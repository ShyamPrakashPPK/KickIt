const db = require('../config/connections')
const collection = require('../config/collections')
const multer = require('multer')
const objectId = require('mongodb').ObjectId
module.exports = {
    //________________SEATCH PRODUCT________________
    getProductsBySearch: (searchData) => {
        console.log(searchData, "LLLLLLLLLLLLLLLLLLLLLL");
        return new Promise(async (resolve, reject) => {
            let length = searchData.length;
            let products = []
            if (length == 0 || searchData === " ") {
                resolve(products)
            } else {
                var re = new RegExp(searchData, "i");
                products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ title: re }).toArray()
                console.log(products);
                resolve(products)
            }
        })
    },
    //________________ADD PRODUCTS__________________
    addProduct: (product, callback) => {
        console.log(product, "from controller 8..............//////////");
        db.get().collection('product').insertOne(product).then((data) => {
            callback(data.insertedId)
        })
    },
    //________________GET PRODUCTS_________________
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
        })
    },
    //________________GET PRODUCTS_________________
    getoldProducts: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({_id:-1}).toArray()
            resolve(product)
        })
    },
    //___SINGLE PRODUCT
    getSingleProduct: (singleproid) => {
        return new Promise(async (resolve, reject) => {
            let singleproduct = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(singleproid) })
            resolve(singleproduct)
        })
    },
    //___________EDIT PRODUCT____________
    getProductDetails: (proEditId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proEditId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        prodName: proDetails.prodName,
                        prodCategory: proDetails.prodCategory,
                        categoryDiscount: proDetails.categoryDiscount,
                        prodBrand: proDetails.prodBrand,
                        prodMRP: proDetails.prodMRP,
                        productDiscount: proDetails.productDiscount,
                        prodPrice:proDetails.prodPrice,
                        totalDiscount: proDetails.totalDiscount,
                        prodStock: proDetails.prodStock,
                        prodDescription: proDetails.prodDescription,
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    //_________________DELETE PRODUCTS_________________
    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(prodId) }).then((response) => {

                resolve(response)
            })
        })
    },
    // multerdiskStorage({
    //     destiantion=(req,file,cb)=>{
    //             cb(null,'uploads')
    //     },
    //     d
    // })
    getcategoryKids: () => {
        return new Promise(async(resolve, reject) => {
            let kids =await db.get().collection(collection.PRODUCT_COLLECTION).find({ prodCategory: 'Kids' }).toArray()
            resolve(kids)
        })
    },
    getcategoryMen: () => {
        return new Promise(async(resolve, reject) => {
            let men = await db.get().collection(collection.PRODUCT_COLLECTION).find({ prodCategory: 'Mens' }).toArray()
            resolve(men)
        })
    },
    getcategoryWomen: () => {
           return new Promise(async(resolve,reject)=>{
            let women=await db.get().collection(collection.PRODUCT_COLLECTION).find({prodCategory:'Women'}).toArray()
            resolve(women)
        })
    },


}