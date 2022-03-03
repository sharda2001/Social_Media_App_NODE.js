const  express = require('express')
const router = express.Router()
const auth=require('../../middleware/auth')
const {check, validationResult}=require('express-validator/check')

const profile=require('../../models/Profile')
const user=require('../../models/User')

router.get('/me',auth, async (req, res) => {
    try{
        const profile=await profile.findOne({user:req.user.id}).populate(user,['name','avatar'])

        if(!profile){
            return res.status(400).json({msg:'there is no profile'})
        }
        res.json(profile)
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

router.post(
    '/',
    [
        auth,
        [
            check('status','Status is required')
            .not()
            .isEmpty(),
            check('skill','skill is required').not().isEmpty
        ]
    ],
    async(req,res) =>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkdin
        }= req.body;

        // build profileField 
        const profileField={};
        profileField.user=req.user.id;
        if(company)profileField.company=company
        if(website)profileField.website=website
        if(location)profileField.location=location
        if(bio)profileField.bio=bio
        if(status)profileField.status=status
        if(githubusername)profileField.githubusername=githubusername
        if(skills){
            profileField.skills=skills.split(',').map(skill.trim());
        }
        // build socila object

        profileField.social={}
        if(youtube)profileField.social.youtube=youtube;
        if(twitter)profileField.social.twitter=twitter;
        if(facebook)profileField.social.facebook=facebook;
        if(linkdin)profileField.social.linkdin=linkdin;
        if(instagram)profileField.social.instagram=instagram;

        try{
            let profile= await profile.findOne({user:req.user.id});
            //  update
            if (profile){
                profile=await profile.findOneAndUpdate(
                    {user:req.user.id},
                    {$set:profileField},
                    {new:true}
                );
                return res.json(profile)
            }
            // creat
            profile=new profile(profileField)

            await profile.save();
            
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error')
        }

        console.log(profileFields.skills)
        res.send('hello')


    }
);


// @route Get api/profile/user/:user_id
// @desc get profile by user id
// @access public
router.get('/user/:user_id',async(req,res)=>{
    try{
        const profiles = await profile.findOne({user:req.params.user_id}).popolate('user',['name','avatar'])
        if(!profile) return res.status(400).json({msg:'profile not found'})
        res.json(profiles)
    }catch(err){
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res .status(400).json({msg:'profile not found'})
        }
        res.status(500).send('Server Error')
    }
})


// @route DELETE api/profile
// @desc Delete profile, user&posts
// @access private
router.get('/',auth, async(req,res)=>{
    try{
        // @todo - remove users posts

        // remove profile
        await profile.findOneAndRemove({user:req.user.id});
        // remove user
        await user.findOneAndRemove({_id:req.user.id});

        res.json({msg:'user deleted'})
    }catch(err){
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res .status(400).json({msg:'profile not found'})
        }
        res.status(500).send('Server Error')
    }
})


// @route PUT api/profile/experience
// @desc add profile experience
// @access private
router.put('/experience',
[
    auth,
    [
    check('title','Title is required')
    .not()
    .isEmpty(),
    check('company','company is required')
    .not()
    .isEmpty(),
    check('from','from date is required')
    .not()
    .isEmpty()

]],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const{
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }=req.body;

    const newExp={
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try{
        const profile=await profile.findOne({user:req.user.id});

        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
    }catch(err){
        console.error(err.message);
        req.status(500).send('Server Error')
    }

});

// @route DELETE api/profile/experience/:exp_id
// @desc DELETE experience from profile
// @access private

router.delete('/experience/:exp_id',auth,async(req,res)=>{
    try{
        const profile=await profile.findOne({user:req.user.id})

        // Get remove index
        const removeIndex=profile.experience
        .map(item=>item.id)
        .indexof
        (req.params.exp_id);

        profile.experience.splice(removeIndex,1)

        await profile.save();

        res.json(proflie);

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});


// @route PUT api/profile/education
// @desc add profile education
// @access private
router.put(
    '/education',
[
    auth,
    [
    check('school','school is required')
    .not()
    .isEmpty(),
    check('degree','Degree is required')
    .not()
    .isEmpty(),
    check('fieldofstudy','field of study is required')
    .not()
    .isEmpty()

]],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const{
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }=req.body;

    const newExp={
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try{
        const profile=await profile.findOne({user:req.user.id});

        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile);
    }catch(err){
        console.error(err.message);
        req.status(500).send('Server Error')
    }

});

// @route DELETE api/profile/experience/:exp_id
// @desc DELETE experience from profile
// @access private

router.delete('/experience/:exp_id',auth,async(req,res)=>{
    try{
        const profile=await profile.findOne({user:req.user.id})

        // Get remove index
        const removeIndex=profile.experience
        .map(item=>item.id)
        .indexof(req.params.edu_id);

        profile.experience.splice(removeIndex,1)

        await profile.save();

        res.json(proflie);
        
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

module.exports=router;