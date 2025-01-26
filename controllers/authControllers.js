const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");
const { log } = require("console");

const defaultImagePath = path.join(
  __dirname,
  "../public/images/userProfile.png"
);
// module.exports.registerUser= async (req,res)=>{
//     try {
//         let {name, email, password}=req.body;
//         let user=await userModel.findOne({email:email})
//         if(user){
//             req.flash("error", "You have already account you can login with your email or password");
//             return res.redirect('/')

//         }

//         const defaultImageBuffer = fs.readFileSync(defaultImagePath);
//         bcrypt.genSalt(10, (err, salt)=>{
//             bcrypt.hash(password, salt, async (err, hash)=>{
//                 if(err) return res.send(err.message);
//                 else {
//                     let user=await userModel.create({
//                         name,
//                         email,
//                         password:hash,
//                         profile: defaultImageBuffer,
//                     });

//                     let token=generateToken(user);
//                     res.cookie("token", token)
//                     res.status(201).json({ message: "User created successfully, now you can login." });
//                     req.flash("success","User created succesfully, Now you can login");
//                     res.redirect('/')
//                 }
//             });
//         })

//     } catch (error) {
//         res.send(error.message);

//     }
// }

module.exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await userModel.findOne({ email });

        if (user) {
            req.flash("error", "You already have an account. Please log in with your email and password.");
            return res.redirect('/');
        }

        const defaultImageBuffer = fs.readFileSync(defaultImagePath);

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        user = await userModel.create({
            name,
            email,
            password: hash,
            profile: defaultImageBuffer,
        });

        const token = generateToken(user);
        res.cookie("token", token);
        req.flash("success", "User created successfully. Now you can log in.");
        
        // Respond with a redirect only
        return res.redirect('/');

    } catch (error) {
        console.error(error);
        // Ensure only one response is sent
        if (!res.headersSent) {
            return res.status(500).send(error.message);
        }
    }
};


module.exports.loginUser = async (req, res) => {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email: email });
  if (!user) {
    req.flash("error", "Email or Password Incorrect");
    return res.redirect("/");
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = generateToken(user);
      res.cookie("token", token);
      res.redirect("/user/shop");
    } else {
      req.flash("error", "Email or Password Incorrect");
      return res.redirect("/");
    }
  });
};

module.exports.userLogout = (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
};

//For APIs
module.exports.apiRegisterUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    
    let user = await userModel.findOne({ email: email });
    if (user) {
      return res.status(400).json({ error: "User already exists. Please log in instead." });
    }

    const defaultImageBuffer = fs.readFileSync(defaultImagePath);
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return res.status(500).json({ error: "Error generating salt" });
      bcrypt.hash(password, salt, async (err, hash) => {
        
        if (err) return res.status(500).json({ error: "Error hashing password" });
        else {
          let user = await userModel.create({
            name,
            email,
            password: hash,
            profile: defaultImageBuffer,
          });

          let token = generateToken(user);

          // Set the token as a cookie
          res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
            sameSite: 'Strict' // Helps prevent CSRF attacks
          });

          res.status(201).json({
            message: "User created successfully. You can now log in.",
            token: token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email
            }
          });
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports.apiLoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email or Password Incorrect" });
    }
    
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        const token = generateToken(user);

        // Set the token as a cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
          sameSite: 'Strict' // Helps prevent CSRF attacks
        });

        return res.status(200).json({ message: "Login successful", token });
      } else {
        return res.status(400).json({ error: "Email or Password Incorrect" });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


module.exports.apiUserLogout = (req, res) => {
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) }); 
    return res.status(200).json({ message: "Logout successful" });
};


