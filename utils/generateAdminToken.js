const jwt=require('jsonwebtoken')
// Function to generate a JWT token for an admin using ADMIN_KEY
const generateAdminToken = (admin) => {
    // Include any necessary claims for admin token (like admin role)
    return jwt.sign(
        {
            email: admin.email,
            id: admin._id,
            role: 'admin' // Add a claim indicating this is an admin token
        },
        process.env.ADMIN_KEY, // Use ADMIN_KEY for signing the token
        { expiresIn: '1h' }    // Optional: Token expiration time (e.g., 1 hour)
    );
};

module.exports.generateAdminToken = generateAdminToken;