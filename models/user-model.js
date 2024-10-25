const mongoose=require("mongoose")

mongoose.connect(`mongodb://localhost:27017/ecommarce`)

const userSchema=mongoose.Schema({
    name:{
        type:String,
        minLength:3,
        trim:true
    },
    email:String,
    password:String,
    cart:{
        type:Array,
        default:[],
    },
    isAdmin:Boolean,
    order:{
        type:Array,
        default:[],
    },
    contact:Number,
    picture:String
})

module.exports= mongoose.model("user", userSchema)