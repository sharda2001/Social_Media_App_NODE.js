const  express = require('express')
const router = express.Router();
const{check,validationResult}=require('express-validator/check');
const { selectFields } = require('express-validator/src/select-fields');
const auth=require('../../middleware/auth');

const post=require('../../models/post')
const profile=require('../../models/profile');
const user = require('../../models/user');

// @route POST api/post
// @desc create a post
// @access privates

router.get('/',[auth,[
    check('text','text is required')
    .not()
    .isEmpty()
]],
async (req, res) => {
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    try{
        const user=await user.findById(req.user.id).select('-password');

        const newPost=new post({
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        })

        const post=await newPost.save();

        res.json(post)

    }catch(err){
        console.error(err.message);
        res.status(500).send('server error')
    }

});
module.exports=router;