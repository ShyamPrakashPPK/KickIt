var db = require('../config/connections')
var collection = require('../config/collections')
const { response } = require('../app')
var objectId = require('mongodb').ObjectId

module.exports = {
    //________________ADD CATEGORY__________________
    addCategory: (category, callback) => {
        db.get().collection('category').insertOne(category).then((data) => {
            callback(data.insertedId)
        })
    },
    //________________GET CATEGORIES__________________
    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },
    //_________________DELETE category_________________
    deleteCategory: (catId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(catId) }).then((response) => {
                resolve(response)
            })
        })
    },
    //____________________Edit Category_____________
    getCategoryDetails: (catEditId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(catEditId) }).then((category) => {
                resolve(category)
            })
        })
    },
    //_________________Update Category________
    updateCategory: (catId, catDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION)
                .updateOne({ _id: objectId(catId) }, {
                    $set: {
                        categoryName: catDetails.categoryName,
                        categoryDescription: catDetails.categoryDescription,
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    //______________Category Discount____________________
    getCategoryDiscount: (categoryName) => {
        console.log(categoryName, "hello");
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ categoryName: categoryName }).then((response) => {
                console.log(response,"<-------------------response from category helpers/55");
                resolve(response.categoryDiscount )
            })
        })
    },
}
