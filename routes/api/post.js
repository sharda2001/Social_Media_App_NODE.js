const  express = require('express')
const router = express.Router();
const{check,validationResult}=require('express-validator/check');
const { selectFields } = require('express-validator/src/select-fields');
const res = require('express/lib/response');
const auth=require('../../middleware/auth');

const Post=require('../../models/Post')
const Profile=require('../../models/Profile');
const User = require('../../models/User');

// @route POST api/post
// @desc create a post
// @access private

router.post('/',auth,[
    check('text','text is required')
    .not()
    .isEmpty()
],
async (req, res) => {
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    };

    try{
        const user=await User.findById(req.user.id).select('-password');

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
        res.json(post);
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
        const post=await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({msg:'Post not found'})
        }
        res.json(post);
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

        if(!post){
            return res.status(404).json({msg:'Post not found'})
        }

        // check user
        if(post.user.toString() !== req.user.id){
            return res.send(401).json({msg:"user not unauthorised"})
        }
        await post.remove()

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
        const post=await Post.findById(req.params.id);

        // check if the post has already been liked
        if(
            post.likes.filter(like =>like.user.toString()===req.user.id).length>0
            ){
            return res.status(400).json({msg:'post already liked'});
        }
        post.likes.unshift({user:req.user.id});
        
        await post.save();

        res.json(post.likes);

    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error')
    }
});


// @route PUT api/post/unlike/:id
// @desc like a post
// @access privates
router.put('/unlike/:id',auth,async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);

        // check if the post has already been liked
        if(
            post.likes.filter(like =>like.user.toString()===req.user.id).length===0
            ){
            return res.status(400).json({msg:'post is not yet been liked'});
        }

        // get remove index
        const removeIndex=post.likes
        .map(like => like.user.toString())
        .indexOf(req.user.id);

        post.likes.splice(removeIndex,1)
        
        await post.save();

        res.json(post.likes);

    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error')
    }
});

// @route POST api/post/comment/:id
// @desc Comment on a post
// @access private

router.post(
    '/comment/:id',
    auth,
    [
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
        const user=await User.findById(req.user.id).select('-password');
        const Post=await post.findById(req.params.id)

        const newComment={
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        };

        Post.comments.unshift(newComment);


        await Post.save();


        res.json(Post.comments);

    }catch(err){
        console.error(err.message);
        res.status(500).send('server error')
    }

});

// @route POST api/post/comment/:id
// @desc Comment on a post
// @access private

router.delete('/comment/:id/:comment_id',auth , async(req,send)=>{
    try{
        const post=await Post.findById(req.params.id)

        // pull out comment
        const comment=post.comments.find(
            comment=> comment.id===req.params.comment_id);

        // make sure comment exist
        if(!comment){
            return res.status(404).json({msg:"comment does not exists"})
        }

        // check user
        if(comment.user.toString()!==req.user.id){
            return res.status(401).json({msg:"user not authorised"})
        }
         // get remove index
         const removeIndex=post.comments
         .map(comment => comment.user.toString())
         .indexOf(req.user.id);
 
         post.comments.splice(removeIndex,1)
         
         await post.save();
 
         res.json(post.comments);

    }catch (err){
        console.error(err.message);
        res.status(500).send('server error')

    }
})

module.exports=router;