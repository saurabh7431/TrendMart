const jwt=require("jsonwebtoken")
const ownerModel=require('../models/owner-model')


module.exports= async (req,res,next)=>{
    if(!req.cookies.token){
        req.flash("error", "You need to login first")
        return res.redirect("/login-admin");
    }

    try {
        let decode=jwt.verify(req.cookies.token, process.env.ADMIN_KEY)
        let owner= await ownerModel.findOne({email:decode.email}).select("-password");
        req.owner=owner;
        next();
    } catch (error) {
        req.flash("error", "something went wrong.")
        res.redirect("/")
    }

}