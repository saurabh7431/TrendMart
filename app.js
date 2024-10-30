const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const flash = require('connect-flash');

require("dotenv").config();

const ownerRouter = require('./routes/ownerRouter');
const userRouter = require('./routes/userRouter');
const productRouter = require('./routes/productRouter');
const indexpage = require('./routes/index');
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const db = require("./config/mongoose-connection");

app.use(cookieParser());
// console.log("JWT Key:", process.env.JWT_KEY);
// console.log("Session Secret:", process.env.EXPRESS_SESSION_SECRET);

// Correct session configuration
app.use(expressSession({
    resave: false,  // Set this to 'false' or 'true' as per your needs
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,  // Make sure you have this in your .env file
}));

// Use flash for temporary messages
app.use(flash());

app.use('/', indexpage);
app.use('/owner', ownerRouter);
app.use('/user', userRouter);
app.use('/product', productRouter);

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
