const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports = async (req, res, next) => {
  try {
    let token;
    if (req.headers['authorization']) {
      token = req.headers['authorization'].split(' ')[1]; // Extract token from header
    } else if (req.cookies.token) {
      token = req.cookies.token; // Extract token from cookies
    }

    if (!token) {
      return res.status(401).json({ message: "You need to login first" });
    }

    let decode;
    try {
      decode = jwt.verify(token, process.env.JWT_KEY);
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Find the user in the database
    let user = await userModel.findOne({ email: decode.email }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error during authentication:", error.message);
    return res.status(500).json({ error: "Something went wrong during authentication." });
  }
};














// module.exports = async (req, res, next) => {
//   try {
    
//     if (!req.cookies.token) {
//       req.flash("error", "You need to login first");
//       return next(); 
//     }

    
//     let decode = jwt.verify(req.cookies.token, process.env.JWT_KEY);

//     // Find the user in the database
//     let user = await userModel.findOne({ email: decode.email }).select("-password");
//     if (!user) {
//       res.clearCookie("token"); 
//       req.flash("error", "Session expired. Please log in again.");
//       return next(); 
//     }

    
//     if (req.originalUrl === "/") {
//       return res.redirect("/user/shop");
//     }

//     req.user = user; 
//     next();
//   } catch (error) {
//     res.clearCookie("token"); 
//     req.flash("error", "Please log in again.");
//     return next(); 
//   }
// };



// module.exports = async (req, res, next) => {
//   try {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ message: "You need to login first" });
//     }

//     let decode = jwt.verify(token, process.env.JWT_KEY);

//     // Find the user in the database
//     let user = await userModel.findOne({ email: decode.email }).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     req.user = user; 
//     next();
//   } catch (error) {
//     console.error("Error during authentication:", error.message);
//     return res.status(500).json({ error: "Something went wrong during authentication." });
//   }
// };





