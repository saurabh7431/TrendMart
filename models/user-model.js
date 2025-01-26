const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
    name: { type: String, trim: true },
    phone: { type: Number, trim: true },
    pincode: { type: String, trim: true },
    locality: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    landmark: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    
});

const userSchema = mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 3
    },
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
            quantity: { type: Number, default: null }
        }
    ],
    orders: [
        {
         type:mongoose.Schema.Types.ObjectId, ref:"order"   
        }
    ],
    address: addressSchema,
    contact: Number,
    profile: {
        type: Buffer,
        default: null
    }
});

module.exports = mongoose.model("user", userSchema);
