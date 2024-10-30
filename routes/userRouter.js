const express=require('express')
const router=express.Router();
const {registerUser, loginUser, userLogout}=require('../controllers/authControllers')

 router.post('/register',registerUser);
 
 router.post('/login', loginUser);
 
 router.get("/logout", userLogout);

router.use('/', (req,res)=>{
    res.send("hello its working fine and good")
});


module.exports=router;