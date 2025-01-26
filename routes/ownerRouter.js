const express=require('express')
const router=express.Router();
const ownerModel=require('../models/owner-model');
const { registerOwner, loginOwner, ownerLogout } = require('../controllers/authAdminControllers');
const isAdminLoggedIn = require('../midileware/isAdminLoggedIn');
const upload = require('../config/multer-config');
const { populate } = require('dotenv');
const productModel=require("../models/product-model")


// if(process.env.NODE_ENV==="development"){

//     router.post('/create', async (req,res)=>{
//         let owner= await ownerModel.findOne()
        
//         if(owner.length> 0){
//             return res.status(503).send("You don't have permission to create a new owner")
//         }
//         let {name, email, password,}=req.body;
//         let createdOwner= await ownerModel.create({
//             name,
//             email, 
//             password,
//         })
//         return res.status(201).send(createdOwner);
        
//     })
// }

router.post("/create", registerOwner)
router.post("/login", loginOwner)
router.get('/logout',ownerLogout)


// Route to handle GET requests to the "/owner" URL
router.get('/crateadmin', isAdminLoggedIn, (req, res) => {
    // Retrieve any error messages stored in the session
    let error = req.flash("error");
    
    // Render the "createadmin" EJS template, passing any error messages to the template
    res.render("createadmin", { error });
});

router.use('/createproduct', isAdminLoggedIn, (req,res)=>{
    let success=req.flash("success");
   res.render("createproducts", {success})
})

// Route to handle GET requests to the "/admin" URL
router.get('/adminpage', isAdminLoggedIn, async (req, res) => {
    // Fetch all products from the database using the productModel
    let products = await productModel.find();
    
    // Retrieve any error messages stored in the session
    let error = req.flash("error");
    
    // Render the "admin" EJS template, passing the retrieved products, any error messages, and the logged-in user's information
    res.render("admin", { products, error, owner: req.user });
});

router.use("/profile", isAdminLoggedIn, async (req,res)=>{
    let owner=await ownerModel.findOne({email:req.owner.email}).populate("products");
    res.render("profile", {owner:owner})
})

router.post('/upload', isAdminLoggedIn, upload.single("image"), async (req,res)=>{
    let owner = await ownerModel.findOne({email:req.owner.email})
     // Update the profile picture buffer in the owner's document
     if (owner) {
        owner.profile = req.file.buffer;  // Save the file buffer directly as profile image
        await owner.save();  // Save the updated owner document
     }else{
         // Handle case where owner is not found
         res.status(404).send('Owner not found');
     }
    res.redirect('/owner/profile')
    
    
})
router.get("/upload", (req,res)=>{
    res.render("profilepic")
})

router.get('/updateProfile/:Id', isAdminLoggedIn, async (req, res) => {
    // Find the product by its ID and populate the owner field with related data
    let owner=await ownerModel.findOne({email:req.owner.email})
    let profileImage = await ownerModel.findOne({ _id: req.params.Id });
    
    // Retrieve any success messages stored in the session
    let success = req.flash("success");
    
    // Render the "imageEdit" EJS template, passing the success message and the product image data
    res.render("profileUpdate", { success, profileImage: profileImage, owner:owner });
});


router.post('/updateProfile/:Id', upload.single('image'), async (req, res) => {
    try {
        let image = await ownerModel.findOneAndUpdate(
            { _id: req.params.Id }, 
            { profile: req.file.buffer },
            { new: true }
        );

        req.flash('success', 'Product updated successfully');
        
        res.redirect('/owner/profile');
        
    } catch (error) {
        console.error("Error updating product:", error);
        req.flash('error', 'Failed to update product');
        
        res.redirect('/owner/profile'); 
    }
});


module.exports=router;