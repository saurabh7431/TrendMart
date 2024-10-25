const mongoose=require("mongoose")

const productSchema=mongoose.Schema({
    name:{
        type:String,
        minLength:3,
        trim:true
    },
    image:String,
    price:Number,
    discount:{
        type:Number,
        default: 0
    },
    bgcolor:String,
    pannelcoler:String,
    textcolor:String,
})

module.exports= mongoose.model("products", productSchema)