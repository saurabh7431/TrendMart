const mongoose=require("mongoose")

const ownerSchema=mongoose.Schema({
    name:{
        type:String,
        minLength:3,
        trim:true
    },
    products:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products"
    }],
    email:String,
    password:String,
    contact:Number,
    profile:{
        type:Buffer,
        default:null
    },
    gstin:String,
    isAdmin: {
        type: Boolean,
        default: false  // By default, the owner is not an admin
    },
   
})

module.exports= mongoose.model("owner", ownerSchema)