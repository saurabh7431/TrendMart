const express=require('express')
const router=express.Router();
const isLoggedIn=require("../midileware/isLoggedIn")
const productModel=require("../models/product-model");
const userModel = require('../models/user-model');
const isAdminLoggedIn=require('../midileware/isAdminLoggedIn');


// Route to handle GET requests to the root URL ("/")
router.get("/web",  (req, res) => {
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


//Route to handle API for getting all products
router.get("/", (req, res) => {
  const baseURL = "https://trendmart-3.onrender.com";

  const endpoints = [
    { route: "/user/userLogin", method: "POST" },
    { route: "/user/userRegister", method: "POST" },
    { route: "/user/userShop", method: "GET" },
    { route: "/cart/addtocart/:itemId", method: "POST" },
    { route: "/cart/userCart", method: "GET" },
    { route: "/cart/increase/:itemId", method: "POST" },
    { route: "/cart/decrease/:itemId", method: "POST" },
    { route: "/cart/delete/:index", method: "POST" },
    { route: "/user/buyProduct/:productId", method: "POST" },
    { route: "/user/userAddress/:productId", method: "POST" },
    { route: "/user/userPayment", method: "POST" },
    { route: "/user/userPayment/verify", method: "POST" },
    { route: "/user/userOrders/:orderId", method: "GET" },
    { route: "/user/Search", method: "GET" },
    { route: "/user/profile", method: "GET" },
    { route: "/user/updateprofile/:userId", method: "POST" },
    { route: "/user/userOrders", method: "GET" },
  ];

  return res.status(200).json({
    message: "Welcome to the API root route",
    baseURL: baseURL,
    endpoints: endpoints,
  });
});



 module.exports=router;