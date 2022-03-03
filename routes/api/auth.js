const express = require("express")
const router=express.Router();
const auth=require("../../middleware/auth");
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const config = require("config")
const { check,validationResult }=require("express-validator")

// const user = require("../../models/user");

const User = require("../../models/User");
// @route   GET api/auth
// @desc    Test route
// @access  public

router.get("/",auth,async(req,res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")  //-password its leaves after the data public
        res.json(user);                 //findById(req.user.id) is takes from middleware auth
    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error")
    }
});

// @route   POST api/users
// @desc    authentication user and GET token
// @access  public
router.post("/",[

    check("email","please include a valid email").isEmail(),
    check(
        "password",
        "password is required"
    ).exists()

],
async(req,res) => {
    const errors=validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const { email,password }=req.body;

    try{
        // see if user exists
        let user = await User.findOne({ email })

        if(!user) {
            // res.send("user route");        
            return res
            .status(400)
            .json({ errors: [ { msg: "Invalid credentials" }]});
        }
       

        // compare return a promise
        // 1st parameter is a plain password which was given by the user
        // 2nd is encrypted passwor which was given by the user
        const isMatch = await bcrypt.compare(password,user.password)

        if (!isMatch) {
            return res
            .status(400)
            .json({ errors: [ { msg: "Invalid credentials" }]});
        }

        // return json webtoken
        // res.send("user registered");
        const payload = {
            user: {
                id:user.id
            }
        }

        jwt.sign( 
            payload, 
            config.get("jwtSecret"),
            { expiresIn:360000},
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            } )

    }catch(err){
        console.error(err.message);
        return res.status(500).send("server error");
    }   
})

module.exports=router;