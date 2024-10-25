const mongoose=require("mongoose")

const ownerSchema=mongoose.Schema({
    name:{
        type:String,
        minLength:3,
        trim:true
    },
    email:String,
    password:String,
    products:{
        type:Array,
        default:[],
    },
    contact:Number,
    picture:String,
    gstin:String
})

module.exports= mongoose.model("owner", ownerSchema)