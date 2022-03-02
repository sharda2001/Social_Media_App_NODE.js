const  express = require('express')
const router = express.Router()
const auth= require('../../middleware/auth')
const user=require('../../models/user');
const config=require('config')
const {check, validationResult } = require('express-validator/check');

router.get('/',auth,async(req,res)=>{
    try{
        const user=await user.findById(req.user.id).select('-password')
        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send('server Error')

    }
});


router.post(
    '/',
    [
        check('name','name is required')
        .not()
        .isEmpty(),
        // check('email','please include a valid email').isEmail(),
        check('email').custom(value => {
            return User.findUserByEmail(value).then(user => {
              if (user) {
                return Promise.reject('E-mail already in use');
              }
            });
          }),
        check(
            'password',
            'please enter a password with 6 or more character'
        ).isLength({min:6 , max:12}),
        check('password').custom((password, { req }) => {
            if (password !== req.body.passwordConfirmation) {
              throw new Error('Password confirmation is incorrect');
            }
            return true
          }),
    ], 
    async(req, res) =>{
        const error=validationResult(req)
        if(!error.isEmpty()){
            return res.status(400).json({error:error.array()})
        }
        
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
            user=new user({
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

// s