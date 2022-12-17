var express = require('express');
var router = express.Router();
const { verifyLogin, adminDash, adminLogin,adminLogout,viewProducts,getProducts,postProducts,getEditProducts,postEditProducts,
  deleteProduct, getAllUsers, adminBlockUser, adminUnBlockUser, getRemoveUser, getViewCategories,
   getAddCategory, postAddCategory, adminBlockCategory,adminUnBlockCategory, getDeleteCategory,
  getEditCategory, deleteBanner, getSalesReport, postbestseller,updateCoupon,
   adminAddbestseller, bestsellerview,   categoryViseDiscount, deleteCoupon,unBlockCoupon,blockCoupon, 
  getViewCoupons, changeDeliveryStatus, postAddCoupon, getAddCoupons, removebestseller, removeShowcase, adminAddShowcase,
    postShowcase, adminOrderStatusChange, postEditCategory, getAddBrands, showcaseView, adminAddBanner,
     viewAllBanners,postAddBanner, postAddBrands, viewAllBrands, adminBlockBrand, adminUnblockBrand, adminLoggedIn, 
     getCurrentOrders, adminOrderDetails }=require('../controllers/adminController');


//-----main------
router.get('/',adminLogin)                                                                 
router.post('/loggedIn', adminLoggedIn)                                                
router.get('/logout', adminLogout) 

//-----Dashboard-----
router.get('/dash',adminDash);

//-----Products------
router.get('/all-products',verifyLogin,viewProducts)                                       
router.get('/add-products',verifyLogin,getProducts)                                        
router.post('/add-products',verifyLogin,postProducts)                                     
router.get('/edit-product/:id',verifyLogin,getEditProducts)                              
router.post('/edit-product/:id', verifyLogin, postEditProducts)                           
router.get('/delete-product/:id', verifyLogin, deleteProduct)
router.get('/getCategoryDiscount', verifyLogin, categoryViseDiscount) //to show in add product dropdown

//-----Users----- 
router.get('/all-users', verifyLogin, getAllUsers)                                         
router.get('/blockUser',adminBlockUser)                                                  
router.get('/unBlockUser', adminUnBlockUser)                                             
router.get('/remove-user/:id', verifyLogin, getRemoveUser)

//-----Categories-----
router.get('/view-categories', verifyLogin, getViewCategories)                             
router.get('/blockCategory', adminBlockCategory)                                           
router.get('/unBlockCategory', adminUnBlockCategory)                                       
router.get('/add-category', verifyLogin, getAddCategory)                                  
router.post('/add-category', verifyLogin, postAddCategory)                                 
router.get('/delete-category/:id', verifyLogin, getDeleteCategory)                        
router.get('/edit-category/:id', verifyLogin, getEditCategory)                             
router.post('/edit-category/:id', verifyLogin, postEditCategory)  

//-----Brand-----
router.get('/add-brand', verifyLogin, getAddBrands)                                        
router.post('/add-brand', verifyLogin, postAddBrands)                                      
router.get('/view-brands', verifyLogin, viewAllBrands)                                     
router.get('/blockBrand', adminBlockBrand)                                                 
router.get('/unBlockBrand', adminUnblockBrand) 

//-----Coupons-----
router.get('/add-coupon',verifyLogin,getAddCoupons)
router.post('/add-coupon',verifyLogin,postAddCoupon)
router.post('/update-coupon', verifyLogin, updateCoupon)
router.post('/delete-coupon', verifyLogin, deleteCoupon)
router.get('/view-coupons',verifyLogin,getViewCoupons)
router.get('/blockCoupon', blockCoupon)
router.get('/unBlockCoupon',unBlockCoupon)

//----Orders----
router.get('/current-orders', verifyLogin, getCurrentOrders)                               
router.get('/order-details/',verifyLogin,adminOrderDetails)  
router.post('/order-statusChange',adminOrderStatusChange) 
router.post('/changeOrderStatus', changeDeliveryStatus)     


//-----Banner-----
router.get('/add-banner',adminAddBanner)                                                   
router.post('/add-banner', postAddBanner)                                                 
router.get('/view-banners', viewAllBanners)
router.get('/delete-banner/:id',deleteBanner) 

//-----Showcase----
router.get('/view-showcase', showcaseView)
router.get('/add-showcase',adminAddShowcase)    
router.post('/add-showcase', postShowcase)  
router.get('/remove-showcase/:id',removeShowcase) 

router.get('/view-bestseller',bestsellerview)
router.get('/add-bestseller', adminAddbestseller)
router.post('/add-bestseller',postbestseller)
router.get('/remove-bestseller/:id', removebestseller) 


//-----salesReport
router.get('/salesReport',getSalesReport)   





module.exports = router;
  