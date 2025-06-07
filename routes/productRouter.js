const express=require('express')
const router=express.Router();
const upload=require('../config/multer-config')
const productModel=require("../models/product-model");
const ownerModel = require('../models/owner-model');
const isAdminLoggedIn = require('../midileware/isAdminLoggedIn');



 // Route to handle POST requests for creating a new product
router.post('/create', isAdminLoggedIn, upload.single("image"), async (req, res) => {
    try {
        let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;
        let owner=await ownerModel.findOne({email: req.owner.email});
        
        let product = await productModel.create({
            image: req.file.buffer, 
            name,                    
            price,                   
            discount,                
            bgcolor,                 
            panelcolor,              
            textcolor,               
            owner:owner._id
        });
        owner.products.push(product._id)
        await owner.save()
       
        req.flash("success", "Product created successfully");
        
        res.redirect('/owner/admin');
    } catch (error) {
        res.send(error.message);
    }
});


// Route to handle POST requests for updating a product by its ID
router.post('/update/:Id', upload.single('image'), async (req, res) => {
    try {
        let product = await productModel.findOneAndUpdate(
            { _id: req.params.Id },
            { 
                name: req.body.name,     
                price: req.body.price,     
                discount: req.body.discount, 
                bgcolor: req.body.bgcolor, 
                panelcolor: req.body.panelcolor, 
                textcolor: req.body.textcolor  
            }, 
            { new: true } 
        );

        
        req.flash('success', 'Product updated successfully');
        res.redirect('/owner/adminpage');
        
    } catch (error) {
        console.error("Error updating product:", error);
        req.flash('error', 'Failed to update product');
        res.redirect('/owner/adminpage'); 
    }
});


// Route to handle POST requests for updating a product's image by its ID
router.post('/updateImage/:Id', upload.single('image'), async (req, res) => {
    try {
       
        let image = await productModel.findOneAndUpdate(
            { _id: req.params.Id }, 
            { image: req.file.buffer }, 
            { new: true } 
        );

        
        req.flash('success', 'Product updated successfully');
        res.redirect('/owner/adminpage');
        
    } catch (error) {
        
        console.error("Error updating product:", error);
        req.flash('error', 'Failed to update product');
        res.redirect('/owner/adminpage'); 
    }
});


// Route to handle GET requests for editing a product by its ID
router.get('/edit/:Id', isAdminLoggedIn, async (req, res) => {

    let product = await productModel.findOne({ _id: req.params.Id }).populate("owner");
    
    let success = req.flash("success");
    
    res.render("edit", { success, product: product });
});


// Route to handle GET requests for editing an image of a product by its ID
router.get('/imageEdit/:Id', async (req, res) => {
    let productImage = await productModel.findOne({ _id: req.params.Id }).populate("owner");
    
    let success = req.flash("success");
    
    res.render("imageEdit", { success, productImage: productImage });
});


// Route to handle GET requests to delete a product by its ID
router.get('/delete/:Id', async (req, res) => {
    let product = await productModel.findOneAndDelete({ _id: req.params.Id });
    res.redirect('/admin');
});




module.exports=router;
