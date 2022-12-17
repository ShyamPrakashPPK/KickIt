const { response } = require('../app');
const categoryHelpers = require('../helpers/category-helpers');
const productHelpers = require('../helpers/product-helpers');
const productHelper = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const brandHelpers = require('../helpers/brand-helpers');
const adminHelpers = require('../helpers/admin-helpers');
const bannerHelpers = require('../helpers/banner-helpers');
const adminId = 'admin@gmail.com';
const passwordId = '111';


module.exports = {


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                        VERIFY LOGIN                                     //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    verifyLogin: (req, res, next) => {
        if (req.session.admin) {
            next()
        } else {
            res.redirect('/admin')
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                        ADMIN LOGIN                                      //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //RENDER
    adminLogin: (req, res) => {
        res.render('admin/admin-login', { layout: 'a_layout' })
    },
    //LOGIN POST METHOD
    adminLoggedIn: (req, res) => {
        let adminData = { email, password } = req.body;
        if (adminId === email && passwordId === password) {
            req.session.admin = adminData;
            res.redirect('/admin/dash')
        } else {
            req.session.adminLoginError = "Invalid adminId and Password";
            res.redirect('/admin');
        }
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                       LOGOUT                                            //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    adminLogout: (req, res) => {
        req.session.admin.loginStatus = false
        req.session.admin = null
        res.redirect('/admin')
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                  DASHBOARD / INDEX                                      //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    adminDash: async (req, res) => {
        let totalOrder = await adminHelpers.getAllOrderCount()
        let revenue = await adminHelpers.getTotalRevenue()
        let users = await adminHelpers.totalUsers()
        let paymentMethod = await adminHelpers.getPaymentMethods()
        res.render('admin/index', { layout: 'a_layout', admin: true, totalOrder, revenue, users, paymentMethod })
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                      PRODUCTS                                           //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //VIEW RENDER
    viewProducts: (req, res) => {
        productHelper.getAllProducts().then((product) => {
            res.render('admin/all-products', { layout: 'a_layout', product, admin: true })
        })
    },
    //GET ADD PRODUCTS
    getProducts: (req, res) => {
        categoryHelpers.getAllCategory().then((category) => {
            brandHelpers.getAllBrands().then((brand) => {
                res.render('admin/add-products', { layout: 'a_layout', category, brand, admin: true })
            })
        })
    },
    //POST ADD PRODUCT
    postProducts: (req, res) => {
        productHelpers.addProduct(req.body, (id) => {
            let image1 = req.files.image1
            let image2 = req.files.image2
            let image3 = req.files.image3
            let image4 = req.files.image4
            image1.mv('./public/product-images1/' + id + '.jpg')
            image2.mv('./public/product-images2/' + id + '.jpg')
            image3.mv('./public/product-images3/' + id + '.jpg')
            image4.mv('./public/product-images4/' + id + '.jpg')
            res.redirect('/admin/all-products')
        })
    },
    //GET EDIT PRODUCT
    getEditProducts: async (req, res) => {
        let product = await productHelpers.getProductDetails(req.params.id)
        let category = await categoryHelpers.getAllCategory(req.params.id)
        let brand = await brandHelpers.getAllBrands(req.params.id)
        res.render('admin/edit-product', { layout: 'a_layout', product, category, brand, admin: true })
    },
    //POST EDIT PRODUCT
    postEditProducts: async (req, res) => {
        let id = req.params.id
        await productHelpers.updateProduct(req.params.id, req.body).then(() => {
            res.redirect('/admin/all-products')
            // let image1=req.files.image1
            // let image2 = req.files.image2
            // let image3 = req.files.image3
            // let image4 = req.files.image4
            // if (image1,req) {
            //     let image = req.files.image1
            //     image.mv('./public/product-images1/' + id + '.jpg')
            // }
            // else {
            // }
            // if (image2,req) {
            //     let image = req.files.image2
            //     image.mv('./public/product-images2/' + id + '.jpg')
            // }
            // else {
            // }
            // if (image3,req) {
            //     let image = req.files.image3
            //     image.mv('./public/product-images3/' + id + '.jpg')
            // }
            // else {
            // }
            // if (image4,req) {
            //     let image = req.files.image4
            //     image.mv('./public/product-images4/' + id + '.jpg')
            // }
            // else {
            // }
        })
    },
    //DELETE PRODUCT
    deleteProduct: (req, res) => {
        let proId = req.params.id
        productHelpers.deleteProduct(proId).then((response) => {
            res.redirect('/admin/all-products')
        })
    },
    //GET CATEGORY DISCOUNT AJAX
    categoryViseDiscount: (req, res, next) => {
        console.log("reached helpers");
        categoryHelpers.getCategoryDiscount(req.query.categoryName).then((response) => {
            console.log("this is the response--->", response);
            res.json(response)
        })
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                         USERS                                           //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //RENDER SHOW USER PAGE
    getAllUsers: (req, res) => {
        userHelpers.getAllUsers().then((AllUsers) => {
            res.render('admin/all-users', { layout: 'a_layout', AllUsers, admin: true })
        })
    },
    //BLOCK USER
    adminBlockUser: (req, res) => {
        let blockUserId = req.query.id
        adminHelpers.blockUser(blockUserId)
        res.redirect('/admin/all-users')
    },
    //UNBLOCK USER
    adminUnBlockUser: (req, res) => {
        let unblockUserId = req.query.id
        adminHelpers.unblockUser(unblockUserId)
        res.redirect('/admin/all-users')
    },
    //REMOVE USER
    getRemoveUser: (req, res) => {
        let userId = req.params.id
        userHelpers.deleteUser(userId).then((response) => {
            res.redirect('/admin/all-users')
        })
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                      CATEGORY                                           //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //CATEGORY RENDER PAGE 
    getViewCategories: (req, res) => {
        categoryHelpers.getAllCategory().then((category) => {
            res.render("admin/view-categories", { category, layout: 'a_layout', admin: true })
        })
    },

    getAddCategory: (req, res) => {
        res.render("admin/add-category", { layout: 'a_layout', admin: true })
    },
    //posts the category to database....//
    postAddCategory: (req, res) => {
        categoryHelpers.addCategory(req.body, () => {
            res.redirect('/admin/view-categories')
        })
    },
    adminBlockCategory: (req, res) => {
        let BlockCategoryId = req.query.id
        adminHelpers.blockCategory(BlockCategoryId)
        res.redirect('/admin/view-categories')
    },
    adminUnBlockCategory: (req, res) => {
        let unblockCategoryId = req.query.id
        adminHelpers.unblockCategory(unblockCategoryId)
        res.redirect('/admin/view-categories')

    },
    //to delete an already existing category....//
    getDeleteCategory: (req, res) => {
        let catId = req.params.id
        categoryHelpers.deleteCategory(catId).then((response) => {
            res.redirect('/admin/view-categories')
        })
    },
    //get edit category page....//
    getEditCategory: async (req, res) => {
        let category = await categoryHelpers.getCategoryDetails(req.params.id)
        res.render('admin/edit-category', { layout: 'a_layout', category, admin: true })
    },
    //updates the edited category..//
    postEditCategory: (req, res) => {
        let id = req.params.id
        categoryHelpers.updateCategory(req.params.id, req.body).then(() => {
            res.redirect('/admin/view-categories')
        })
    },



    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                         BRAND                                           //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //page to get add brand page...//
    getAddBrands: (req, res) => {
        res.render("admin/add-brand", { layout: 'a_layout', admin: true })
    },
    //posts the brand to the database....//
    postAddBrands: (req, res) => {
        brandHelpers.addBrand(req.body, (id) => {
            let image = req.files.brandLogo
            image.mv('./public/brand-images/' + id + '.jpg', (err, done) => {
                if (!err) {
                    res.render("admin/add-brand", { layout: 'a_layout', admin: true })
                } else {
                    console.log(err);
                }
            })
        })
    },
    //view all existing brands in the database..//
    viewAllBrands: (req, res) => {
        brandHelpers.getAllBrands().then((brand) => {
            res.render("admin/view-brands", { brand, layout: 'a_layout', admin: true })
        })
    },
    //get the page to edit the selected brand.....//
    getEditBrand: (req, res) => {
        res.render("admin/edit-brand", { layout: 'a_layout' })
    },
    adminBlockBrand: (req, res) => {
        let BlockBrandId = req.query.id
        adminHelpers.blockBrand(BlockBrandId)
        res.redirect('/admin/view-brands')
    },
    adminUnblockBrand: (req, res) => {
        let unblockBrandId = req.query.id
        adminHelpers.unblockBrand(unblockBrandId)
        res.redirect('/admin/view-brands')
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                       COUPON                                            //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    getAddCoupons: async (req, res) => {
        let activeCoupons = await adminHelpers.getActiveCoupons()
        let expiredCoupons = await adminHelpers.getExpiredCoupons()
        let coupon = await adminHelpers.getAllCoupons()
        res.render("admin/add-coupon", { activeCoupons, expiredCoupons, coupon, layout: 'a_layout', admin: true })
    },
    postAddCoupon: async (req, res) => {
        req.body.couponDiscount = parseInt(req.body.couponDiscount)
        req.body.maxAmount = parseInt(req.body.maxAmount)
        req.body.minSpend = parseInt(req.body.minSpend)
        let addCoupon = await adminHelpers.addCoupon(req.body)
        if (addCoupon.status === false) {
            req.session.couponError = "Your Entered Coupon code Already exists! Try again..";
        } else {
            req.session.couponError = null
            res.redirect('/admin/add-coupon')
        }
    },
    updateCoupon: async (req, res, next) => {
        let updateCoupon = await adminHelpers.updateCoupon(req.body)
        res.redirect('/admin/add-coupon')
    },
    deleteCoupon: async (req, res, next) => {
        let deleteCoupon = await adminHelpers.deleteCoupon(req.body)
        res.json(response)
    },
    getViewCoupons: (req, res) => {
        adminHelpers.getAllCoupons().then((coupon) => {
            res.render("admin/view-coupons", { coupon, layout: 'a_layout', admin: true })
        })
    },
    blockCoupon: (req, res) => {
        let couponId = req.query.id
        adminHelpers.blockCoupon(couponId)
        res.redirect('/admin/view-coupons')
    },
    unBlockCoupon: (id) => {
        let couponId = req.query.id
        adminHelpers.unBlockCoupon(couponId)
        res.redirect('/admin/view-coupons')
    },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                        ORDER                                            //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //page to render the current orders ((all orders that are currently in the database))...//
    getCurrentOrders: async (req, res) => {
        let orders = await adminHelpers.getCompleteOrders()
        orders.forEach(orders => {
            orders.date = orders.date.toString().substr(4, 17)
        });
        res.render("admin/current-orders", { layout: 'a_layout', orders, admin: true })
    },
    adminOrderDetails: async (req, res) => {
        let orderID = req.query.id
        let products = await adminHelpers.getOrderDetails(orderID)
        let order = await adminHelpers.getOrderCompleteDetails(orderID)
        console.log(products, "<<<<<<<<<>>>>>>>>products<<<<<<>>>>>>>", order, "<<<<<<<<>>>>>>>>>>order<<<<>>>>>");
        res.render("admin/order-details", { layout: 'a_layout', products, order, admin: true })
    },
    adminOrderStatusChange: async (req, res) => {
        let orderId = req.query.id
        let status = req.body.value
    },
    changeDeliveryStatus: (req, res) => {
        let order = req.body
        adminHelpers.updateDeliveryStatus(order).then((response) => {
            res.json({ status: true })
        })
    },


    // changeDeliveryStatus: (req, res) => {
    //     let order = req.body
    //     adminHelpers.updateDeliveryStatus(order).then((response) => {
    //         res.json({ status: true })
    //     })
    // },


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                          BANNER                                         //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //to load banner adding page----------------------------//
    adminAddBanner: (req, res) => {
        res.render("admin/add-banner", { layout: 'a_layout', admin: true })
    },
    //to add banner------------//
    postAddBanner: (req, res) => {
        bannerHelpers.addbanner(req.body, (id) => {
            let image = req.files.banner
            image.mv('./public/banners/' + id + '.jpg', (err, done) => {
                if (!err) {
                    res.render("admin/add-banner", { layout: 'a_layout', admin: true })
                } else {
                    console.log(err);
                }
            })
        })
    },

    viewAllBanners: (req, res) => {
        bannerHelpers.getAllBanner().then((banner) => {
            res.render("admin/view-banners", { banner, layout: 'a_layout', admin: true })
        })
    },
    deleteBanner: (req, res) => {
        let Id = req.params.id
        bannerHelpers.removeBanner(Id).then((response) => {
            res.redirect('/admin/view-banners')
        })
    },

    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                        SHOW CASW                                        //                    
    /////////////////////////////////////////////////////////////////////////////////////////////

    //show case---------
    showcaseView: async (req, res) => {
        let showcase = await bannerHelpers.getShowcase()
        res.render("admin/view-showcase", { showcase, layout: 'a_layout', admin: true })

    },

    adminAddShowcase: (req, res) => {
        res.render("admin/add-showcaseitem", { layout: 'a_layout', admin: true })
    },

    postShowcase: (req, res) => {
        bannerHelpers.addNewShowcase(req.body, (id) => {
            let shoe = req.files.shoe
            let title = req.files.title
            shoe.mv('./public/showcase/shoe/' + id + '.jpg')
            title.mv('./public/showcase/title/' + id + '.jpg')
            res.redirect('/admin/view-showcase')
        })
    },
    removeShowcase: (req, res) => {
        let Id = req.params.id
        bannerHelpers.removeShowcase(Id).then((response) => {
            res.redirect('/admin/view-showcase')
        })
    },

    bestsellerview: async (req, res) => {
        let showcase2 = await bannerHelpers.getbestseller()
        res.render("admin/view-bestseller", { showcase2, layout: 'a_layout', admin: true })
    },

    adminAddbestseller: (req, res) => {
        res.render("admin/add-bestseller", { layout: 'a_layout', admin: true })
    },

    postbestseller: (req, res) => {
        bannerHelpers.addSecondShowcase(req.body, (id) => {
            let shoe = req.files.shoe
            shoe.mv('./public/secondshowcase/' + id + '.jpg')
            res.redirect('/admin/view-bestseller')
        })
    },

    removebestseller:(req,res)=>{
        let Id = req.params.id
        console.log(Id,"id ivedeee ethiii");
        bannerHelpers.removebestseller(Id).then((response) => {
            res.redirect('/admin/view-bestseller')
        })
        
    },
  
  


    /////////////////////////////////////////////////////////////////////////////////////////////
    //                                        SALES REPORT                                     //                    
    /////////////////////////////////////////////////////////////////////////////////////////////
    getSalesReport: async (req, res, next) => {
        let salesReport = await adminHelpers.getSalesReport()
        console.log(salesReport);
        res.render('admin/sales-report', { layout: 'a_layout', admin: true, salesReport })
    },


}


