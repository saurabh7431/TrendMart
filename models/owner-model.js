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
    gstin:String,
    isAdmin: {
        type: Boolean,
        default: false  // By default, the owner is not an admin
    },
    products:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products"
    }]
})

module.exports= mongoose.model("owner", ownerSchema)