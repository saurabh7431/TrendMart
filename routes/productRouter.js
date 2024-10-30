const express=require('express')
const router=express.Router();
const upload=require('../config/multer-config')
const productModel=require("../models/product-model")



 // Route to handle POST requests for creating a new product
router.post('/create', upload.single("image"), async (req, res) => {
    try {
        // Destructure the required fields from the request body
        let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;
        
        // Create a new product using the productModel and the provided data
        let product = await productModel.create({
            image: req.file.buffer, // Store the uploaded image as a buffer
            name,                    // Assign the product's name
            price,                   // Assign the product's price
            discount,                // Assign the product's discount
            bgcolor,                 // Assign the background color of the product
            panelcolor,              // Assign the panel color of the product
            textcolor                // Assign the text color of the product
        });

        // Set a success message in the session to notify the user
        req.flash("success", "Product created successfully");
        
        // Redirect the user to the admin page after successful creation
        res.redirect('/owner/admin');
    } catch (error) {
        // In case of an error, send the error message as a response
        res.send(error.message);
    }
});


// Route to handle POST requests for updating a product by its ID
router.post('/update/:Id', upload.single('image'), async (req, res) => {
    try {
        // Find the product by its ID and update its fields with the provided data
        let product = await productModel.findOneAndUpdate(
            { _id: req.params.Id }, // Query to find the product by ID
            { 
                name: req.body.name,       // Update the product's name
                price: req.body.price,     // Update the product's price
                discount: req.body.discount, // Update the product's discount
                bgcolor: req.body.bgcolor, // Update the product's background color
                panelcolor: req.body.panelcolor, // Update the product's panel color
                textcolor: req.body.textcolor  // Update the product's text color
            }, 
            { new: true } // Option to return the updated document
        );

        // Set a success message in the session to notify the user
        req.flash('success', 'Product updated successfully');
        
        // Redirect the user back to the admin page after successful update
        res.redirect('/admin');
        
    } catch (error) {
        // Log the error to the console for debugging purposes
        console.error("Error updating product:", error);
        
        // Set an error message in the session to notify the user about the failure
        req.flash('error', 'Failed to update product');
        
        // Optionally, redirect back to the previous page or admin page
        res.redirect('/admin'); // You might want to redirect to an error page or back to the edit page
    }
});


// Route to handle POST requests for updating a product's image by its ID
router.post('/updateImage/:Id', upload.single('image'), async (req, res) => {
    try {
        // Find the product by its ID and update its image with the uploaded file buffer
        let image = await productModel.findOneAndUpdate(
            { _id: req.params.Id }, // Query to find the product by ID
            { image: req.file.buffer }, // Update operation to set the new image
            { new: true } // Option to return the updated document
        );

        // Set a success message in the session to notify the user
        req.flash('success', 'Product updated successfully');
        
        // Redirect the user back to the admin page after successful update
        res.redirect('/admin');
        
    } catch (error) {
        // Log the error to the console for debugging purposes
        console.error("Error updating product:", error);
        
        // Set an error message in the session to notify the user about the failure
        req.flash('error', 'Failed to update product');
        
        // Optionally, redirect back to the previous page or admin page
        res.redirect('/admin'); // You might want to redirect to an error page or back to the edit page
    }
});


// Route to handle GET requests for editing a product by its ID
router.get('/edit/:Id', async (req, res) => {
    // Find the product by its ID and populate the owner field with related data
    let product = await productModel.findOne({ _id: req.params.Id }).populate("owner");
    
    // Retrieve any success messages stored in the session
    let success = req.flash("success");
    
    // Render the "edit" EJS template, passing the success message and the product data
    res.render("edit", { success, product: product });
});


// Route to handle GET requests for editing an image of a product by its ID
router.get('/imageEdit/:Id', async (req, res) => {
    // Find the product by its ID and populate the owner field with related data
    let productImage = await productModel.findOne({ _id: req.params.Id }).populate("owner");
    
    // Retrieve any success messages stored in the session
    let success = req.flash("success");
    
    // Render the "imageEdit" EJS template, passing the success message and the product image data
    res.render("imageEdit", { success, productImage: productImage });
});


// Route to handle GET requests to delete a product by its ID
router.get('/delete/:Id', async (req, res) => {
    // Find the product by its ID and delete it from the database
    let product = await productModel.findOneAndDelete({ _id: req.params.Id });
    
    // Redirect the user back to the admin page after deletion
    res.redirect('/admin');
});




module.exports=router;
