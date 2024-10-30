const mongoose=require("mongoose")

const userSchema=mongoose.Schema({
    name:{
        type:String,
        minLength:3,
        trim:true
    },
    email:String,
    password:String,
    cart:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products"
    }],
    order:{
        type:Array,
        default:[],
    },
    contact:Number,
    picture:String
})

module.exports= mongoose.model("user", userSchema)