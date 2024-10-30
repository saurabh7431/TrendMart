const multer = require('multer');

// Define Memory Storage for Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports=upload;