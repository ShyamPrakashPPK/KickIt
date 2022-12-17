const db = require('../config/connections')
const collection = require('../config/collections')
const { response } = require('../app')
const objectId = require('mongodb').ObjectId

module.exports = {
    //________________ADD CATEGORY__________________
    addBrand: (brand, callback) => {
        db.get().collection('brand').insertOne(brand).then((data) => {
            callback(data.insertedId)
        })
    },
    //________________GET CATEGORIES__________________
    getAllBrands: () => {
        return new Promise(async (resolve, reject) => {
            let brand = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
            resolve(brand)
        })
    },
    //_________________DELETE category_________________
    // deleteBradnd: (brandId) => {
    //     return new Promise((resolve, reject) => {
    //         db.get().collection(collection.BRAND_COLLECTION).deleteOne({ _id: objectId(brandId) }).then((response) => {
    //             resolve(response)
    //         })
    //     })
    // },
    //____________________Edit Brand_____________
    getBrandDetails: (brandEditId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).findOne({ _id: objectId(brandEditId) }).then((brand) => {
                resolve(brand)
            })
        })
    },
    updateBrand: (brandId, brandDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION)
                .updateOne({ _id: objectId(brandId) }, {
                    $set: {
                        brandName: brandDetails.brandName,
                        brandDescription: brandDetails.brandDescription,
                    }
                }).then((response) => {
                    resolve()
                })
        })
    }
}
