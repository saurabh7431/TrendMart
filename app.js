const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser=require("body-parser");
const expressSession = require("express-session");
const flash = require("connect-flash");


require("dotenv").config();

const ownerRouter = require("./routes/ownerRouter");
const userRouter = require("./routes/userRouter");
const productRouter = require("./routes/productRouter");
const indexpage = require("./routes/index");
const cartRouter=require('./routes/cartRouter')
const jwt = require("jsonwebtoken");
const cors = require("cors");


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const db = require("./config/mongoose-connection");
const isLoggedIn = require("./midileware/isLoggedIn");
const allowedOrigins = ["http://localhost:3001", "http://localhost:3000","http://192.168.29.170:8081", " http://192.168.29.170"];

app.use(
    cors({
      origin: function (origin, callback) {
        // React frontend ke liye origin allow karein
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true, // React ke liye cookies ya credentials allow karein
    })
  );


app.use(cookieParser());
app.use(bodyParser.json());

// console.log("JWT Key:", process.env.JWT_KEY);
// console.log("Session Secret:", process.env.EXPRESS_SESSION_SECRET);

// Correct session configuration
app.use(
  expressSession({
    resave: false, // Set this to 'false' or 'true' as per your needs
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRET, // Make sure you have this in your .env file
  })
);

// Use flash for temporary messages
app.use(flash());

app.use("/", indexpage);
app.use("/owner", ownerRouter);
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use('/cart' , cartRouter);


// app.listen(3000, () => {
//   console.log("Server is running on http://localhost:3000");
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

