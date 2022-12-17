const db = require('../config/connections')
const collection = require('../config/collections')
const { response } = require('../app')
const objectId = require('mongodb').ObjectId

module.exports = {

    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                             BANNER                                      //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //________________Add Banner__________________
    addbanner: (banner, callback) => {
        db.get().collection(collection.BANNER_COLLECTIONS).insertOne(banner).then((data) => {
            callback(data.insertedId)
        })
    },
    //________________Get Banner__________________
    getAllBanner: () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTIONS).find().toArray()
            resolve(banner)
        })
    },
    removeBanner:(Id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTIONS).deleteOne({ _id: objectId(Id) }).then((response) => {
                resolve(response)
            })
        })
    },
    getIndexBanner:()=>{
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTIONS).find().limit(3).toArray()
            resolve(banner)
        })
    },

    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                          SHOW CASE                                      //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    //--------------------Show case feature------------
    addNewShowcase:(showcase,callback)=>{
        console.log(showcase);
        db.get().collection(collection.SHOWCASE_COLLECTION).insertOne(showcase).then((data)=>{
            callback(data.insertedId)
        })
    },
    //---view showcase-----
    getShowcase:()=>{
        return new Promise(async(resolve,reject)=>{
            let showcase=await db.get().collection(collection.SHOWCASE_COLLECTION).find().toArray()
            resolve(showcase)
        })
    },
    //----delete showcase
    removeShowcase: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SHOWCASE_COLLECTION).deleteOne({ _id: objectId(Id) }).then((response) => {
                resolve(response)
            })
        })
    },

    getbestseller: () => {
        return new Promise(async (resolve, reject) => {
            let showcase = await db.get().collection(collection.BESTSELLER_COLLECTION).find().toArray()
            resolve(showcase)
        })
    },
    addSecondShowcase: (showcase, callback) => {
        console.log('reached helperds 74------------------');
        console.log(showcase);
        db.get().collection(collection.BESTSELLER_COLLECTION).insertOne(showcase).then((data) => {
            callback(data.insertedId)
        })
    },
    removebestseller: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BESTSELLER_COLLECTION).deleteOne({ _id: objectId(Id) }).then((response) => {
                resolve(response)
            })
        })
    },
}
