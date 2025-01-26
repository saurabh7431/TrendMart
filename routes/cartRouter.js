const express = require("express");
const router = express.Router();
const userModel = require("../models/user-model");
const productModel = require("../models/product-model");
const isLoggedIn = require("../midileware/isLoggedIn");

// Route to add item to cart
// router.post("/addtocart/:id", isLoggedIn, async (req, res) => {
//   try {
//     const {email}=req.body;
//     console.log("Email from req.user:", email);
    
//     let user = await userModel.findOne({email});

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     let isItemInCart = user.cart.some((item) =>
//       item.product.equals(req.params.id)
//     );

//     if (isItemInCart) {
//       return res
//         .status(400)
//         .json({ message: "Product is already in your cart" });
//     }

//     let product = await productModel.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     let cartItem = user.cart.find((item) => item.product.equals(product._id));

//     if (cartItem) {
//       cartItem.quantity += 1;
//     } else {
//       user.cart.push({
//         product: product._id,
//         quantity: 1,
//       });
//     }

//     await user.save();

//     res.status(200).json({ message: "Item added to cart", cart: user.cart });
//   } catch (error) {
//     console.error("Error adding item to cart:", error);
//     res
//       .status(500)
//       .json({ message: "Something went wrong. Please try again." });
//   }
// });

router.post("/addtocart/:id", isLoggedIn, async (req, res) => {
  try {
    const email = req.user.email; // Extract email from decoded tokenS

    let user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let isItemInCart = user.cart.some((item) =>
      item.product.equals(req.params.id)
    );

    if (isItemInCart) {
      return res.status(400).json({ message: "Product is already in your cart" });
    }

    let product = await productModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
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

    res.status(200).json({ message: "Item added to cart", cart: user.cart });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});




// API Route to user cart
router.get("/userCart", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel
      .findOne({ email: req.user.email }) // Use req.user.email
      .populate("cart.product");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Map each cart item to include a base64-encoded image if stored as Buffer
    const cartWithImages = user.cart.map(item => ({
      ...item.toObject(),
      product: {
        ...item.product.toObject(),
        image: item.product.image ? item.product.image.toString('base64') : null,
      },
    }));

    res.status(200).json({ cart: cartWithImages });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});


  // API Route to increase the quantity of a product in the cart
router.post("/increase/:productId", isLoggedIn,  async (req, res) => {
    try {
        const email = req.user.email;
        const productId=req.params.productId
        
        
        
      let user = await userModel.findOne({email});
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let cartItem = user.cart.find((item) =>
        item.product.equals(productId)
      );
      
      if (!cartItem) {
        return res
          .status(404)
          .json({ message: "Product not found in your cart" });
      }
      cartItem.quantity += 1;
      await user.save();
      res
        .status(200)
        .json({ message: "Product quantity increased by 1", cart: user.cart });
    } catch (error) {
      console.error("Error increasing product quantity:", error);
      res
        .status(500)
        .json({ message: "Something went wrong. Please try again." });
    }
  });
  
  // API Route to increase the quantity of a product in the cart
  router.post("/decrease/:productId", isLoggedIn, async (req, res) => {
      try {
        const email = req.user.email;
        const productId=req.params.productId
        let user = await userModel.findOne({email});
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        let cartItem = user.cart.find((item) =>
          item.product.equals(productId)
        );
        if (!cartItem) {
          return res
            .status(404)
            .json({ message: "Product not found in your cart" });
        }
         if (cartItem.quantity > 1) {
          cartItem.quantity -= 1;
        }
        await user.save();
        res
          .status(200)
          .json({ message: "Product quantity increased by 1", cart: user.cart });
      } catch (error) {
        console.error("Error increasing product quantity:", error);
        res
          .status(500)
          .json({ message: "Something went wrong. Please try again." });
      }
    });

    
// API Route to delete a product from the cart by index
    router.post("/delete/:index", isLoggedIn, async (req, res) => {
      try {
        let email = req.user.email;
        let user = await userModel.findOne({email}).populate('cart.product');
    
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        const index = parseInt(req.params.index, 10);
        if (index < 0 || index >= user.cart.length) {
          return res.status(400).json({ message: "Invalid index" });
        }
    
        user.cart.splice(index, 1);
    
        await user.save();
    
        // Map each cart item to include a base64-encoded image if stored as Buffer
        const cartWithImages = user.cart.map(item => ({
          ...item.toObject(),
          product: {
            ...item.product.toObject(),
            image: item.product.image && item.product.image.data
              ? Buffer.from(item.product.image.data).toString('base64')
              : null,
          },
        }));
    
        res.status(200).json({ message: "Product deleted from cart", cart: cartWithImages });
      } catch (error) {
        console.error("Error deleting product from cart:", error);
        res.status(500).json({ message: "Something went wrong. Please try again." });
      }
    });
    
module.exports = router;
