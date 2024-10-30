const express=require('express')
const router=express.Router();
const isLoggedIn=require("../midileware/isLoggedIn")
const productModel=require("../models/product-model");
const userModel = require('../models/user-model');
const isAdminLoggedIn=require('../midileware/isAdminLoggedIn')


// Route to handle GET requests to the root URL ("/")
router.get("/", (req, res) => {
    // Retrieve any error messages stored in the session
    let error = req.flash("error");
    
    // Retrieve any success messages stored in the session
    let success = req.flash("success");
    
    // Render the "index" EJS template, passing any error and success messages, and setting loggedIn to false
    res.render("index", { error, success, loggedIn: false });
});


// Route to handle GET requests to the "/login-admin" URL
router.get('/login-admin', (req, res) => {
    // Retrieve any error messages stored in the session
    let error = req.flash("error");
    
    // Render the "loginadmin" EJS template, passing any error messages and setting loggedIn to false
    res.render("loginadmin", { error, loggedIn: false });
});



// Route to handle GET requests to the "/owner" URL
router.get('/owner', isAdminLoggedIn, (req, res) => {
    // Retrieve any error messages stored in the session
    let error = req.flash("error");
    
    // Render the "createadmin" EJS template, passing any error messages to the template
    res.render("createadmin", { error });
});


// Route to handle GET requests to the "/admin" URL
router.get('/admin', isAdminLoggedIn, async (req, res) => {
    // Fetch all products from the database using the productModel
    let products = await productModel.find();
    
    // Retrieve any error messages stored in the session
    let error = req.flash("error");
    
    // Render the "admin" EJS template, passing the retrieved products, any error messages, and the logged-in user's information
    res.render("admin", { products, error, owner: req.user });
});


// Route to handle GET requests to the "/shop" URL
router.get("/shop", isLoggedIn, async (req, res) => {
    // Fetch all products from the database using the productModel
    let products = await productModel.find();

    // Retrieve any success messages stored in the session
    let success = req.flash("success");

    // Retrieve any info messages stored in the session
    let info = req.flash("info");

    // Render the "shop" EJS template, passing the retrieved products and flash messages
    res.render("shop", { products, success, info });
});


// Route to handle displaying the cart page
router.get("/cart", isLoggedIn, async (req, res) => {
    // Find the user based on the email of the currently logged-in user (req.user.email)
    // Populate the "cart" field which likely contains references to products (assuming 'cart' is an array of product IDs)
    let user = await userModel.findOne({ email: req.user.email }).populate("cart");

    // Render the 'cart' EJS view and pass the 'user' object to the view
    // This allows access to the user's data, including their cart items, in the EJS template
    res.render("cart", { user });
});

// Route to add an item to the user's cart
router.get("/addtocart/:id", isLoggedIn, async (req, res) => {
    try {
        // Find the user
        let user = await userModel.findOne({ email: req.user.email });

        // Check if the item is already in the cart
        let isItemInCart = user.cart.some(item => item.equals(req.params.id));

        if (isItemInCart) {
            // If the item is already in the cart, send a message
            req.flash("info", "Item is already in your cart.");
        } else {
            // If the item is not in the cart, add it
            user.cart.push(req.params.id);
            await user.save();
            req.flash("success", "Item Added to Your Cart.");
        }

        // Redirect back to the shop
        res.redirect("/shop");

    } catch (error) {
        console.error("Error adding item to cart:", error);
        req.flash("error", "Something went wrong. Please try again.");
    }
});


 module.exports=router;