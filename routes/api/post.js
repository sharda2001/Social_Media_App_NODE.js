const  express = require('express')
const router = express.Router();
const{check,validationResult}=require('express-validator/check');
const { selectFields } = require('express-validator/src/select-fields');
const auth=require('../../middleware/auth');

const Post=require('../../models/Post')
const Profile=require('../../models/Profile');
const User = require('../../models/User');

// @route POST api/post
// @desc create a post
// @access privates

router.post('/',auth,[
    check('text','text is required')
    .not()
    .isEmpty()
],
async (req, res) => {
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    try{
        const user=await user.findById(req.user.id).select('-password');

        const newPost=new Post({
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        });

        const post=await newPost.save();

        res.json(post)

    }catch(err){
        console.error(err.message);
        res.status(500).send('server error')
    }

});

// @route GET api/post
// @desc get all post
// @access privates

router.get('/',auth,async(req,res)=>{
    try{
        const post=await Post.find().sort({date:-1});
        res.json(Post);
    }catch(err){
        console.error(err.message);
        res.status(500).send('server error')  
    }
})

// @route GET api/post/:id
// @desc get post by id
// @access privates

router.get('/:id',auth,async(req,res)=>{
    try{
        const post=await Post.findById(req.param.id);

        if(!post){
            return res.status(404).json({msg:'Post not found'})
        }
        res.json(Post);
    }catch(err){
        console.error(err.message);
        if(err.kind==='ObjectId'){
            return res.status(404).json({msg:'Post not found'})
        }
        res.status(500).send('server error')  
    }
});

// @route DELETE api/post/:id
// @desc delete a post
// @access privates

router.delete('/:id',auth,async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);

        if(!Post){
            return res.status(404).json({msg:'Post not found'})
        }

        // check user
        if(post.user.toString() !== req.user.id){
            return res.send(401).json({msg:"user not unauthorised"})
        }
        await this.post.remove()

        res.json({msg:'Post removed'});
    }catch(err){
        console.error(err.message);
        if(err.kind==='ObjectId'){
            return res.status(404).json({msg:'Post not found'})
        }
        res.status(500).send('server error')  
    }
});

// @route PUT api/post/like/:id
// @desc like a post
// @access privates
router.put('/like/:id',auth,async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id)

        // check if the post has already been liked
        if(post.likes.filter(like =>like.user.toString()===req.user.id).length>0){
            return res.json(400).json({msg:'post already liked'});
        }
        post.likes.unshift({user:req.user.id});
        
        await post.save();

        res.json(post.json)
    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})

module.exports=router;