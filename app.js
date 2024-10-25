const express=require("express")
const path=require("path")
const app=express()
const db=require("./config/mongoose-connection");
const  ownerRouter=require('./routes/ownerRouter')
const userRouter=require('./routes/userRouter')
const productRouter=require('./routes/productRouter')

const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const cookieParser=require("cookie-parser")
app.use(cookieParser())

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, "public")))

app.use('/owner', ownerRouter);
app.use('/user', userRouter);
app.use('/product', productRouter);

app.listen(3000)