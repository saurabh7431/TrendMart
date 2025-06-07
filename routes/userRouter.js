const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const router = express.Router();
const {
  registerUser,
  loginUser,
  userLogout,
  apiRegisterUser,
  apiLoginUser,
  apiUserLogout,
} = require("../controllers/authControllers");
const isLoggedIn = require("../midileware/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const orderModel = require("../models/order-model");
const upload = require("../config/multer-config");
const { route } = require("./ownerRouter");
const Razorpay = require('razorpay'); 
const { log } = require("console");
require("dotenv").config();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", userLogout);

//For APIs
router.post;
router.post("/userRegister", apiRegisterUser);
router.post("/userLogin", apiLoginUser);
router.get("/userLogout", apiUserLogout);
router.get("/userShop", async (req, res) => {
  try {
    const products = await productModel.find();

    // Map each product to include a base64-encoded image if stored as Buffer
    const productsWithImages = products.map((product) => ({
      ...product.toObject(),
      image: product.image ? product.image.toString("base64") : null,
    }));

    res.json(productsWithImages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// API Router to User profile by email
router.get("/profile", isLoggedIn, async (req, res) => {
  let email =req.user.email;
  // let user =req.user
  try {
    // Ensure `req.user.email` exists
    if (!req.user || !email) {
      return res.status(400).json({ message: "User not logged in" });
    }

    // Fetch the user from the database
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Construct the user profile response
    const userProfile = {
      ...user.toObject(),
      image:
        user.image && user.image.data
          ? Buffer.from(user.image.data).toString("base64")
          : null,
    };

    res.status(200).json({ user: userProfile });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// API Router to User profile update by Id
router.post("/updateprofile/:Id", upload.single("image"), async (req, res) => {
  
  try {
    let user = await userModel.findOne({ _id: req.params.Id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.file) {
      // Store the image buffer (the uploaded file is in req.file.buffer)
      user.profile = req.file.buffer; 
    }

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
});

// API Router to buy product by Id
router.get("/buyProduct/:Id", isLoggedIn, async (req, res) => {
  try {
    let email = req.user.email;
    let user = await userModel.findOne({ email });
    let product = await productModel.findById({ _id: req.params.Id });
    let profileImage = await productModel.findById({ _id: req.params.Id });
    // Find the product in the user's cart
    const cart = user.cart;
    const cartItem = cart.find(
      (item) => item.product.toString() === req.params.Id
    );

    let quantity = cartItem ? cartItem.quantity : 0;

    res.status(200).json({ success:true, user, product, quantity });
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Internal Server Error'})
  }
});

// API Router to save address 
router.post("/userAddress/:Id", isLoggedIn, async (req, res) => {
  try {
    let email = req.user.email;
    
    
    const {
      name,
      phone,
      pincode,
      locality,
      address,
      city,
      state,
      landmark,
      alternatePhone,
      addressType,
    } = req.body;
    
    

    // Validate required fields
    if (!addressType) {
      return res.status(400).send("Address type is required");
    }

    // Find the user by email (assuming req.user contains the logged-in user's details)
    let user = await userModel.findOne({ email });

    if (!user) {
      console.log("User not found");
      return res.status(404).send("User not found");
    }

    // Save the address in the user's document
    user.address = {
      name,
      phone,
      pincode,
      locality,
      address,
      city,
      state,
      landmark,
      alternatePhone,
      addressType,
    };

    // Save the user document
    await user.save();

    const cartItem = user.cart.find(
      (item) => item.product.toString() === req.params.Id
    );

    if (!cartItem) {
      console.log(`Cart item not found for product ID: ${req.params.Id}`);
      return res.status(404).send("Cart item not found");
    }
    // Fetch the product details using the product ID from the URL
    let product = await productModel.findById(cartItem.product);

    if (!product) {
      cconsole.log(`Product not found with ID: ${cartItem.product}`);
      return res.status(404).send("Product not found");
    }
    
    //Quantity extract
    let quantity = cartItem.quantity;
    let Useraddress = user.address;

    // Redirect to order detail page or render the response with product details
    res.status(200).json({success: true,
    product,
    productImage:product.image,
    user,
    quantity,
    address:Useraddress,
  });
  } catch (err) {
    console.error("Error saving address:", err);
    res.status(500).send("Server error");
  }
});


router.post('/userPayment', isLoggedIn, async (req, res) => {
  const { userId, productId, quantity, totalMRP } = req.body;
  

  if (!userId || !productId || !quantity || !totalMRP || isNaN(totalMRP) || totalMRP <= 0) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    // Define platform fee (if applicable)
    // const platformFee = 20; // Adjust this value as needed
    const payableAmount = Math.round((totalMRP) * 100); // Convert to paisa

    // Generate receipt ID
    const receiptId = `receipt_${userId}_${Date.now()}`.substring(0, 40);

    // Create Razorpay order
    const options = {
      amount: payableAmount, // in paisa
      currency: 'INR',
      receipt: receiptId,
    };

    const razorOrder = await razorpay.orders.create(options);

    // Save order in the database
    const newOrder = new orderModel({
      user: userId,
      product: productId,
      quantity: quantity,
      totalMRP: totalMRP,
      payableAmount: payableAmount / 100, // Convert back to INR
      razorpayOrderId: razorOrder.id,
      orderDate: new Date(),
      status: 'Pending',
    });

    const savedOrder = await newOrder.save();

    // Update user's orders array
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send('User not found.');
    }

    user.orders.push(savedOrder._id);
    await user.save();

    // Render payment page with Razorpay details
    res.status(200).json({keyId: process.env.RAZORPAY_KEY_ID,
      orderId: razorOrder.id,
      amount: payableAmount,
      error: null,
    });
  } catch (error) {
    console.error('Error saving order:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/userPayment/verify', isLoggedIn, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const order = await orderModel.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'Paid', paymentId: razorpay_payment_id },
        { new: true }
      );

      if (!order) {
        console.error('Order not found for verification.');
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      // Return orderId in the response
      return res.json({ success: true, message: 'Payment verified successfully', orderId: order._id });
    } else {
      console.error('Signature mismatch. Verification failed.');
      return res.json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Error during payment verification:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



router.get("/userOrders/:orderId", isLoggedIn, async (req, res) => {
  try {    const { orderId } = req.params;
  
    const order = await orderModel.findById(orderId).populate("product");

    if (!order) return res.status(404).send("Order not found.");
    const user = await userModel.findById(order.user);
    if (!user) return res.status(404).send("User not found.");

    const product = await productModel.findById(order.product);

    res.status(200).json({ success: true, order, user, product });
  } catch (error) {
    console.error("Error fetching order details:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/userOrders", isLoggedIn, async (req, res) => {
  try {
    const userEmail = req.user.email; // Email from logged-in user (from isLoggedIn middleware)

    const user = await userModel.findOne({ email: userEmail });
    if (!user) return res.status(404).send("User not found");

    const orders = await orderModel
      .find({ user: user._id })
      .populate("product"); // Assuming `product` field is ref to productModel

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching user orders:", error.message);
    res.status(500).send("Internal Server Error");
  }
});



// Routes for ejs-----------------------------------------------------------------------------------------------
// Route to handle GET requests to the "/shop" URL
router.get("/shop", isLoggedIn, async (req, res) => {
  let products = await productModel.find();

  let success = req.flash("success");

  let info = req.flash("info");

  res.render("shop", { products, success, info });
});

// Route to APIs handle GET requests to the "/shop" URL
// router.get("/userShop", async (req, res) => {
//   try {
//     let products = await productModel.find();
//     let success = req.flash("success");
//     let info = req.flash("info");

//     res.status(200).json({ products, success, info });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// });

// Route to add an item to the user's cart
router.get("/addtocart/:id", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });

    let isItemInCart = user.cart.some((item) =>
      item.product.equals(req.params.id)
    );

    if (isItemInCart) {
      req.flash(
        "info",
        "Product is already in your cart. Check your cart for more details."
      );
      return res.redirect("/user/shop");
    }

    let product = await productModel.findById(req.params.id);

    if (!product) {
      req.flash("error", "Product not found.");
      return res.redirect("/user/shop");
    }

    let cartItem = user.cart.find((item) => item.product.equals(product._id));

    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      user.cart.push({
        product: product._id,
        quantity: 1,
      });
    }

    await user.save();

    req.flash("success", "Item added to cart.");
    res.redirect("/user/shop");
  } catch (error) {
    console.error("Error adding item to cart:", error);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/user/cart");
  }
});

// Route to handle displaying the cart page
router.get("/cart", isLoggedIn, async (req, res) => {
  let success = req.flash("success");

  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart.product");

  res.render("cart", { user: user, success });
});

// Route to handle increase cart item quantity
router.get("/item/increase/:productId", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });

    let cartItem = user.cart.find((item) =>
      item.product.equals(req.params.productId)
    );

    if (!cartItem) {
      req.flash("error", "Product not found in your cart.");
      return res.redirect("/user/cart");
    }

    if (cartItem) {
      cartItem.quantity += 1;
    }

    await user.save();

    req.flash("success", "Product quantity increased. +1");
    res.redirect("/user/cart");
  } catch (error) {
    console.error("Error decreasing product quantity:", error);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/user/cart");
  }
});

// Route to handle decrease cart item quantity
router.get("/item/decrease/:productId", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });

    let cartItem = user.cart.find((item) =>
      item.product.equals(req.params.productId)
    );

    if (!cartItem) {
      req.flash("error", "Product not found in your cart.");
      return res.redirect("/user/cart");
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    }

    await user.save();

    req.flash("success", "Product quantity decreased. -1");
    res.redirect("/user/cart");
  } catch (error) {
    console.error("Error decreasing product quantity:", error);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/user/cart");
  }
});

// Router to delete an item from the cart by product ID
router.get("/item/delete/:index", isLoggedIn, async (req, res) => {
  const index = parseInt(req.params.index);

  try {
    // Find the user and get their cart
    const user = await userModel.findById(req.user._id);

    if (user && user.cart && user.cart.length > index) {
      user.cart.splice(index, 1);
      await user.save();

      res.redirect("/user/cart");
    } else {
      res.status(404).send("Cart item not found");
    }
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    res.status(500).send("An error occurred while deleting the item.");
  }
});

// Router to User profile by email
router.get("/myProfile", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });

  res.render("userProfile", { user });
});

// Router to Edit profile photo
router.get("/updateMyProfile/:Id", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let profileImage = await userModel.findOne({ _id: req.params.Id });

  let success = req.flash("success");
  res.render("myProfileUpdate", {
    success,
    profileImage: profileImage,
    user: user,
  });
});

// Route to get user's profile for update
// router.post("/updateprofile/:Id", async (req, res) => {
//   try {
//     let user = await userModel.findOne({ _id: req.params.Id });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     user.name = req.body.name || user.name;
//     user.email = req.body.email || user.email;
//     if (req.file) {
//       user.profile = req.file.buffer.toString("base64"); // Assume multer middleware handles file upload
//     }
//     await user.save();
//     res.status(200).json({ message: "Profile updated successfully", user });
//   } catch (error) {
//     console.error("Error updating user profile:", error);
//     res
//       .status(500)
//       .json({ message: "Something went wrong. Please try again." });
//   }
// });

// Router to upload profile photo
router.post("/updateMyProfile/:Id", upload.single("image"), async (req, res) => {
    try {
      let image = await userModel.findOneAndUpdate(
        { _id: req.params.Id },
        { profile: req.file.buffer },
        { new: true }
      );

      req.flash("success", "Profile updated successfully");

      res.redirect("/user/myProfile");
    } catch (error) {
      console.error("Error updating product:", error);
      req.flash("error", "Failed to update product");

      res.redirect("/user/myProfile");
    }
  }
);

router.get("/buy/:Id", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    let product = await productModel.findById({ _id: req.params.Id });
    let profileImage = await productModel.findById({ _id: req.params.Id });
    // Find the product in the user's cart
    const cart = user.cart;
    const cartItem = cart.find(
      (item) => item.product.toString() === req.params.Id
    );

    let quantity = cartItem ? cartItem.quantity : 0;

    let success = req.flash("success");
    res.render("buy", { success, profileImage, user, product, quantity , });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});


router.post("/address/:Id", isLoggedIn, async (req, res) => {
    try {
      const {
        name,
        phone,
        pincode,
        locality,
        address,
        city,
        state,
        landmark,
        alternatePhone,
        addressType,
      } = req.body;
  
      // Validate required fields
      if (!addressType) {
        return res.status(400).send("Address type is required");
      }
  
      // Find the user by email (assuming req.user contains the logged-in user's details)
      let user = await userModel.findOne({ email: req.user.email });
  
      if (!user) {
        console.log("User not found");
        return res.status(404).send("User not found");
      }
  
      // Save the address in the user's document
      user.address = {
        name,
        phone,
        pincode,
        locality,
        address,
        city,
        state,
        landmark,
        alternatePhone,
        addressType,
      };
  
      // Save the user document
      await user.save();
  
      const cartItem = user.cart.find(
        (item) => item.product.toString() === req.params.Id
      );
  
      if (!cartItem) {
        console.log(`Cart item not found for product ID: ${req.params.Id}`);
        return res.status(404).send("Cart item not found");
      }
      // Fetch the product details using the product ID from the URL
      let product = await productModel.findById(cartItem.product);
  
      if (!product) {
        cconsole.log(`Product not found with ID: ${cartItem.product}`);
        return res.status(404).send("Product not found");
      }
      
      //Quantity extract
      let quantity = cartItem.quantity;
      let Useraddress = user.address;
      const merchantTransactionId = crypto.randomUUID();
      // Flash success message
      req.flash("success", "Address updated successfully!");
  
      // Redirect to order detail page or render the response with product details
      res.render("orderdetail", {
        success: req.flash("success"),
        product,
        productImage:product.image,
        user,
        quantity,
        address:Useraddress,
        merchantTransactionId,
      });
    } catch (err) {
      console.error("Error saving address:", err);
      res.status(500).send("Server error");
    }
  });
  

// // Route to render the payment page
// router.get("/payment", isLoggedIn, async (req, res) => {
//   try {
//     // Fetch user by email
//     const user = await userModel
//       .findOne({ email: req.user.email })
//       .populate("orders");

//     // Check if user has items in the cart
//     if (!user || user.cart.length === 0) {
//       console.error("User not found or cart is empty.");
//       return res.redirect("/");
//     }

//     // Fetch the product and profile image by the first product in the cart
//     const product = await productModel.findById(user.cart[0].product);
//     // Fetch the user's orders
//     const orders = await orderModel
//       .findOne({ _id: { $in: user.orders } })
//       .populate("product");
//     // const profileImage = await productModel.findById(user.cart[0].product);

//     // Calculate the quantity from the cart
//     const cart = user.cart;
//     const cartItem = cart.find(
//       (item) => item.product.toString() === user.cart[0].product.toString()
//     );
//     const quantity = cartItem ? cartItem.quantity : 0;

//     // Handle success messages (e.g., from flash messages)
//     const success = req.flash("success");

//     // Render the payment page with the retrieved data
//     res.render("payment", { success, user, product, quantity, orders });
//   } catch (err) {
//     console.error(err);
//     res.redirect("/");
//   }
// });


  

// // Route to show order placed details
// router.get("/order/:orderId", isLoggedIn, async (req, res) => {
//   try {
//     const orderId = req.params.orderId;

//     const order = await orderModel.findById(orderId).populate("product");
//     console.log("OrderId", order);
//     if (!order) {
//       return res.status(404).send("Order not found.");
//     }
//     const user = await userModel.findById(order.user);
//     if (!user) {
//       return res.status(404).send("User not found.");
//     }
//     const product = await productModel.findById(order.product);
//     const profileImage = await productModel.findById(order.product);
//     res.render("orderPlaced", { order, user, product, profileImage });
//   } catch (error) {
//     console.error("Error fetching order details:", error.message);
//     res.status(500).send("Internal Server Error");
//   }
// });






// 3. **Render Payment Page**
// router.get("/payment", isLoggedIn, async (req, res) => {
//   try {
//     const user = await userModel.findOne({ email: req.user.email }).populate("orders");

//     if (!user || user.cart.length === 0) {
//       return res.redirect("/"); // Redirect if cart is empty
//     }

    // const product = await productModel.findById(user.cart[0].product);
    // const cartItem = user.cart.find(
    //   (item) => item.product.toString() === user.cart[0].product.toString()
    // );
    // const quantity = cartItem ? cartItem.quantity : 0;

//     const success = req.flash("success");
//     res.render("payment", { success, user, product, quantity });
//   } catch (error) {
//     console.error("Error rendering payment page:", error.message);
//     res.redirect("/");
//   }
// });

//  **Order Details**
router.get("/orders/:orderId", isLoggedIn, async (req, res) => {
  try {    const { orderId } = req.params;
    const order = await orderModel.findById(orderId).populate("product");

    if (!order) return res.status(404).send("Order not found.");
    const user = await userModel.findById(order.user);
    if (!user) return res.status(404).send("User not found.");

    const product = await productModel.findById(order.product);

    res.render("orderPlaced", { order, user, product });
  } catch (error) {
    console.error("Error fetching order details:", error.message);
    res.status(500).send("Internal Server Error");
  }
});



// Initialize Razorpay instance with your credentials
const razorpay = new Razorpay({
  key_id: 'rzp_test_Bm1MoW2S5b2af8',
  key_secret: 'wQmiaWkzm2MwdUOM9IVTMHhP',
});

router.get('/payment', isLoggedIn, async (req, res) => {

  try {
         // Fetch user by email
         const user = await userModel
           .findOne({ email: req.user.email })
           .populate("orders");
    
         // Check if user has items in the cart
         if (!user || user.cart.length === 0) {
           console.error("User not found or cart is empty.");
           return res.redirect("/");
       }
    
         // Fetch the product and profile image by the first product in the cart
         const product = await productModel.findById(user.cart[0].product);
         // Fetch the user's orders
         const orders = await orderModel
           .findOne({ _id: { $in: user.orders } })
           .populate("product");
         // const profileImage = await productModel.findById(user.cart[0].product);
    
         // Calculate the quantity from the cart
         const cart = user.cart;
         const cartItem = cart.find(
         (item) => item.product.toString() === user.cart[0].product.toString()
         );
         const quantity = cartItem ? cartItem.quantity : 0;
    
         // Handle success messages (e.g., from flash messages)
         const success = req.flash("success");
    
         // Render the payment page with the retrieved data
         res.render("razorPayment", { success, user, product, quantity, orders });
       } catch (err) {
         console.error(err);
         res.redirect("/");
       }
});


// Create Payment Order and Save to Database
router.post('/payment', isLoggedIn, async (req, res) => {
  const { userId, productId, quantity, totalMRP } = req.body;

  if (!userId || !productId || !quantity || !totalMRP || isNaN(totalMRP) || totalMRP <= 0) {
    return res.status(400).render('razorPayment', { error: 'Invalid input data' });
  }

  try {
    // Define platform fee (if applicable)
    // const platformFee = 20; // Adjust this value as needed
    const payableAmount = Math.round((totalMRP) * 100); // Convert to paisa

    // Generate receipt ID
    const receiptId = `receipt_${userId}_${Date.now()}`.substring(0, 40);

    // Create Razorpay order
    const options = {
      amount: payableAmount, // in paisa
      currency: 'INR',
      receipt: receiptId,
    };

    const razorOrder = await razorpay.orders.create(options);

    // Save order in the database
    const newOrder = new orderModel({
      user: userId,
      product: productId,
      quantity: quantity,
      totalMRP: totalMRP,
      payableAmount: payableAmount / 100, // Convert back to INR
      razorpayOrderId: razorOrder.id,
      orderDate: new Date(),
      status: 'Pending',
    });

    const savedOrder = await newOrder.save();

    // Update user's orders array
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send('User not found.');
    }

    user.orders.push(savedOrder._id);
    await user.save();

    // console.log('Order saved successfully:', savedOrder);

    // Render payment page with Razorpay details
    res.render('razorPayment', {
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: razorOrder.id,
      amount: payableAmount,
      error: null,
    });
  } catch (error) {
    console.error('Error saving order:', error.message);
    res.status(500).render('razorPayment', { error: 'Internal Server Error' });
  }
});


router.post('/payment/verify', isLoggedIn, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const order = await orderModel.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'Paid', paymentId: razorpay_payment_id },
        { new: true }
      );

      if (!order) {
        console.error('Order not found for verification.');
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      console.log('Payment verified successfully:', order._id); // Log the orderId

      // Return orderId in the response
      return res.json({ success: true, message: 'Payment verified successfully', orderId: order._id });
    } else {
      console.error('Signature mismatch. Verification failed.');
      return res.json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Error during payment verification:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



router.get('/payment/success', isLoggedIn, async (req, res) => {
  const { orderId } = req.query;

  if (!orderId) {
    console.error('Missing orderId in query parameters.');
    return res.redirect('/'); // Redirect to home or error page
  }

  try {
    const user = await userModel.findOne({ email: req.user.email }).populate('orders');
    if (!user) {
      console.error('User not found.');
      return res.redirect('/');
    }

    const order = await orderModel.findById(orderId).populate('product');
    if (!order) {
      console.error('Order not found.');
      return res.redirect('/');
    }

    console.log('Fetched order successfully:', order);

    res.render('success', { user, order });
  } catch (error) {
    console.error('Error fetching payment success details:', error);
    res.status(500).send('Internal Server Error');
  }
});




router.use("/", (req, res) => {
  res.send("hello its working fine and good");
});

module.exports = router;
