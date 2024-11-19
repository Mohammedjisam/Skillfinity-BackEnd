const express = require("express")
const adminRoute = express.Router()
const { adminLogin,logoutAdmin,forgotPassword,resetPassword,students,tutors,listUser,unlistUser,unlisTtutor,lisTtutor,getCategories,updateCategory,deleteCategory,addCategory} = require("../../controller/adminController")
const verifyAdmin = require('../../middleware/verifyAdmin')

adminRoute.post('/login',adminLogin)
adminRoute.post('/forgot', forgotPassword);
adminRoute.post('/reset/:token', resetPassword);
adminRoute.get('/students',verifyAdmin,students)
adminRoute.put("/listuser/:id",verifyAdmin,listUser)
adminRoute.put("/unlistuser/:id",verifyAdmin,unlistUser)
adminRoute.put("/listtutor/:id",verifyAdmin,lisTtutor)
adminRoute.put("/unlisttutor/:id",verifyAdmin,unlisTtutor)
adminRoute.get('/tutors',verifyAdmin,tutors)
adminRoute.post("/logout",verifyAdmin,logoutAdmin)
adminRoute.post('/addcategory',verifyAdmin, addCategory)
adminRoute.get('/categories', getCategories)
adminRoute.put('/category/:id',verifyAdmin, updateCategory)
adminRoute.delete('/category/:id',verifyAdmin, deleteCategory)

module.exports = adminRoute
