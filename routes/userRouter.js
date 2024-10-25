const express=require('express')
const router=express.Router();



 router.use('/', (req,res)=>{
    res.send("hello its working")
})
module.exports=router;