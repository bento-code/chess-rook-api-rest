const {Router} =require("express");
const router=Router();
const authController=require('../controllers/auth.controller')
//router.get('/verifyToken', authController.verifyToken);
module.exports=router;