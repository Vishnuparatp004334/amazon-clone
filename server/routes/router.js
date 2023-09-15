const express = require("express");
const router = new express.Router();
const products = require("../models/productsSchema")
const User  = require("../models/userSchema")
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");

router.get("/getproducts", async(req,res)=>{
    try {
        const productsdata = await products.find();
        // console.log(productsdata + "mil gya data");
        res.status(201).json(productsdata);
    } catch (error) {
        console.log("error"+ error.message);
    }
})

// get individual data

router.get("/getproductsone/:id", async(req,res)=>{
    try {
        const {id} = req.params;
        // console.log(id);

        const individual = await products.findOne({id:id});
        // console.log(individual);
        res.status(201).json(individual)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.post("/register", async(req,res)=>{
    const {fname, email, mobile, password, cpassword} = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({error: "fill all the details"});
    }

    try {
        
        const preuser = await User.findOne({email:email});
        if (preuser) {
            res.status(422).json({error: "This email is already exist"});
        }else if (password !== cpassword) {
            res.status(422).json({error: "password are not matching"})
        }else{
            const finaluser = new User({
                fname,email,mobile,password,cpassword
            });

            const storedata = await finaluser.save();
            console.log(storedata + "user successfully added");
            res.status(201).json(storedata);
        }
    } catch (error) {
        res.status(422).send({error: "error hai"});
    }
})

router.post("/login", async(req,res)=>{
    const {email,password} = req.body;

    if (!email || !password) {
        res.status(400).json({error:"fill the details"});
    }
    try {
        
        const userlogin = await User.findOne({email:email});
        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            if (!isMatch) {
                res.status(400).json({error: "invalid credential"})
            }else{
                const token = await userlogin.generateAuthtoken();
                // console.log(token);

                res.cookie("eccomerce", token,{
                    expires: new Date(Date.now() + 2589000),
                    httpOnly:true
                })
                res.status(201).json(userlogin)
            }
        }else{
            res.status(400).json({error: "user not find"})
        }
    } catch (error) {
        res.status(400).json({error:"invalid credientials"})
    }
})

// adding item in cart
router.post("/addcart/:id",authenticate, async(req,res)=>{
    try {
        const {id} = req.params;
        const cart = await products.findOne({id:id});
        // console.log(cart);

        const Usercontact = await User.findOne({_id: req.userID});
        // console.log(Usercontact);
        if (Usercontact) {
            const cartData = await Usercontact.addcartdata(cart);
            await Usercontact.save();
            // console.log(cartData);
            res.status(201).json(Usercontact);
        }
    } catch (error) {
        console.log(error);
    }
})

// get data on buynow page
router.get("/cartdetails", authenticate, async(req,res) =>{
    try {
        const buyuser = await User.findOne({_id: req.userID});
        res.status(201).json(buyuser)
    } catch (error) {
        console.log(error + "error on buynow page");
    }
})

// get user is login or not
router.get("/validuser", authenticate, async(req,res)=>{
    try {
        const validuserone = await User.findOne({_id: req.userID});
        // console.log(validuserone);
        res.status(201).json(validuserone);
    } catch (error) {
        console.log(error + "error for valid user");
    }
})

// remove iteams from a cart
router.get("/remove/:id", authenticate,async(req,res)=>{
    try {
        const {id} = req.params;

        req.rootUser.carts = req.rootUser.carts.filter((curel)=>{
            return curel.id != id
        });

        req.rootUser.save();
        res.status(201).json(req.rootUser)
        console.log("iteam removed");
    } catch (error) {
        console.log(error + "jwt provide then remove");
        res.status(400).json(error);
    }
})

// for logout user
router.get("/logout", authenticate, async(req,res)=>{
   try {
    req.rootUser.tokens = req.rootUser.tokens.filter((curelem)=>{
        return curelem.token !== req.token
    });

    res.clearCookie("eccomerce", {path: "/"});
    req.rootUser.save();
    res.status(201).json(req.rootUser.tokens);
    console.log("user logout");
   } catch (error) {
    console.log(error + "jwt provide then logout");
   }
})


module.exports = router;