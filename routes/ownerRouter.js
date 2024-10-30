const express=require('express')
const router=express.Router();
const ownerModel=require('../models/owner-model');
const { registerOwner, loginOwner, ownerLogout } = require('../controllers/authAdminControllers');
const isAdminLoggedIn = require('../midileware/isAdminLoggedIn');


// if(process.env.NODE_ENV==="development"){

//     router.post('/create', async (req,res)=>{
//         let owner= await ownerModel.findOne()
        
//         if(owner.length> 0){
//             return res.status(503).send("You don't have permission to create a new owner")
//         }
//         let {name, email, password,}=req.body;
//         let createdOwner= await ownerModel.create({
//             name,
//             email, 
//             password,
//         })
//         return res.status(201).send(createdOwner);
        
//     })
// }

router.post("/create", registerOwner)
router.post("/login", loginOwner)
router.get('/logout',ownerLogout)

router.use('/admin', isAdminLoggedIn, (req,res)=>{
    let success=req.flash("success");
   res.render("createproducts", {success})
})

module.exports=router;