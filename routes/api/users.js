const  express = require('express');
const router = express.Router();
const gravtar=require('gravatar');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const config=require('config')
const {check, validationResult } = require('express-validator/check');
const User=require('../../models/user');
const gravatar = require('gravatar/lib/gravatar');
// const config = require('config');
// @route  POST api/user 
// @desc  Register user
// @access publics

router.post(
    '/',
    [
        check('name','name is required')
        .not()
        .isEmpty(),
        check('email','please include a valid email').isEmail(),

        check('email').custom(value => {
            return User.findOne({email:value}).then(user => {
              if (user) {
                //   return res 
                //   .status(400).json({errors:[{email:"user is already exist"}]})
                return Promise.reject('E-mail already in exist');
              }
            });
          }),
        check(
            'password',
            'please enter a password with 6 or more character'
        ).isLength({min:6 , max:12}),
        check('password').custom((password, { req }) => {
            if (password !== req.body.password) {
              throw new Error('Password confirmation is incorrect');
            }
            return true
          }),
    ], 
    async(req, res) =>{
        const errors=validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        console.log(req.body)
        const {name,email,password}=req.body;
        try{
            let user=await User.findOne({email});
            if(user){
                return res
                .status(400).json({errors:[{msg:"User already exist"}]});
            }
            const avatar=gravatar.url(email,{
                s:'200',
                r:'pg',
                d:'mm'
            });
            user=new User({
                name,
                email,
                avatar,
                password
            });
            const salt=await bcrypt.genSalt(10);

            user.password=await bcrypt.hash(password,salt);

            await user.save();

            const payload={
                user:{
                    id:user.id
                }
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                {expiresIn:360000},
                (err,token)=>{
                    if (err) throw err;
                    res.json({token})
                })
            // res.send('user registered')

        }catch(err){
            console.error(err.message);
            res.status(500).send('server error')

        }
        

});
module.exports=router;


