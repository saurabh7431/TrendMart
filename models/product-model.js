// Importing the mongoose library to interact with MongoDB
const mongoose = require("mongoose");

// Define a schema for the product model using mongoose.Schema
const productSchema = mongoose.Schema({
    // The name of the product, must be a string with a minimum length of 3 characters, and will be trimmed of whitespace
    name: {
        type: String,
        minLength: 3,
        trim: true
    },
    // The image of the product stored as a buffer (binary data)
    image: Buffer,
    
    // The price of the product, should be a number
    price: Number,

    // The discount on the product, with a default value of 0 if not specified
    discount: {
        type: Number,
        default: 0
    },
    // Background color of the product (string)
    bgcolor: String,
    
    // Panel color of the product (string)
    panelcolor: String,
    
    // Text color associated with the product (string)
    textcolor: String,
    
    // Reference to the owner of the product, which is an ObjectId type referring to the "owner" model
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "owner"
    },
    
    // The quantity of the product, with a default value of 1 if not specified
    quantity: {
        type: Number,
        default: 1
    }
});

// Export the product model, which will use the "products" collection in the database and the defined schema
module.exports = mongoose.model("products", productSchema);
