const express=require('express')
const router=express.Router();
const isLoggedIn=require("../midileware/isLoggedIn")
const productModel=require("../models/product-model");
const userModel = require('../models/user-model');
const isAdminLoggedIn=require('../midileware/isAdminLoggedIn');


// Route to handle GET requests to the root URL ("/")
router.get("/",  (req, res) => {
    // Retrieve any error messages stored in the session
    let error = req.flash("error");
   
    if (req.cookies.token) {
        return res.redirect("/user/shop"); // Redirect logged-in users
      }
    // Retrieve any success messages stored in the session
    let success = req.flash("success");
    
    // Render the "index" EJS template, passing any error and success messages, and setting loggedIn to false
    res.render("index", { error, success, loggedIn: false });
});


// Route to handle login Admin page
router.get('/admin', (req, res) => {
    
    let error = req.flash("error");
    
    
    res.render("loginadmin", { error, loggedIn: false });
});








 module.exports=router;