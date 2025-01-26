const bcrypt=require("bcrypt");
const fs = require('fs');
const path = require('path');
const jwt=require('jsonwebtoken')
const ownerModel=require('../models/owner-model')
const {generateAdminToken}=require("../utils/generateAdminToken");
const userModel = require("../models/user-model");


const defaultImagePath = path.join(__dirname, '../public/images/profile.jpeg');
// Admin Login and create
module.exports.registerOwner= async (req,res)=>{
    try {
        let {name, email, password}=req.body;
        let owner=await ownerModel.findOne({email:email})
        if(owner){ 
            req.flash("error", "You have already account you can login with your email or password");
            return res.redirect('/owner/crateadmin')
        
        }

        const defaultImageBuffer = fs.readFileSync(defaultImagePath);
        bcrypt.genSalt(12, (err, salt)=>{
            bcrypt.hash(password, salt, async (err, hash)=>{
                if(err) return res.send(err.message);
                else {
                    let owner=await ownerModel.create({
                        name,
                        email,
                        password:hash,
                        profile: defaultImageBuffer,
                    });
                    
                    // let token= generateAdminToken(owner);
                    // res.cookie("token", token)
                    res.redirect("/owner/crateadmin")
                    req.flash("success","User created succesfully");
                }
            });
        })

        

    } catch (error) {
        res.send(error.message);
        
    }
}

// module.exports.registerOwner = async (req, res) => {
//     try {
//         let { name, email, password, isAdmin } = req.body; // Include isAdmin from request body
//         let existingOwner = await ownerModel.findOne({ email: email });

//         if (existingOwner) {
//             req.flash("error", "You already have an account. You can log in with your email or password.");
//             return res.redirect('/owner');
//         }

//         // Generate salt and hash the password
//         bcrypt.genSalt(12, (err, salt) => {
//             if (err) return res.send(err.message);
            
//             bcrypt.hash(password, salt, async (err, hash) => {
//                 if (err) return res.send(err.message);
                
//                 // Create a new owner with isAdmin value based on the request
//                 let newOwner = await ownerModel.create({
//                     name,
//                     email,
//                     password: hash,
//                     isAdmin: isAdmin || false // Set isAdmin to true or false based on request, default is false
//                 });
                
//                 let token = generateAdminToken(newOwner); // Generate token for the owner
//                 res.cookie("token", token);
//                 req.flash("success", "User created successfully.");
//                 return res.redirect('/owner'); // Redirect after success
//             });
//         });
//     } catch (error) {
//         res.send(error.message);
//     }
// };

module.exports.loginOwner= async(req,res)=>{
    let {email, password}=req.body;

    let owner=await ownerModel.findOne({email:email});
    if(!owner){
        req.flash("error","Email or Password Incorrect");
        return res.redirect('/admin')
    }

        bcrypt.compare(password, owner.password, (err, result)=>{
           if(result){
            let token=generateAdminToken(owner);
           res.cookie("token", token);
           res.redirect('/owner/adminpage')
           }else{
            req.flash("error", "Email or Password Incorrect")
            return res.redirect('/admin')
           }
        })
}
module.exports.ownerLogout=(req,res)=>{
    res.cookie("token", "")
    res.redirect('/admin')
}
