const express = require("express");
const request = require("request");
const config = require("config");

const router=express.Router();
const { check, validationResult} = require("express-validator")
// const { response } = require("express");
const auth = require("../../middleware/auth");

const Profile = require("../../models/Profile");
const User = require("../../models/User");


// @route   GET api/profile/me
// @desc    Get current users profile
// @access  privates

/** 
 @api {get} /profile Get user profile for the user
 * @apiName Getprofile
 * @apiGroup profile
 *
 * @apiSuccess {String} status, status of the User.
 * @apiSuccess {String} skill, skills of the User.
; */


router.get("/me",auth,async(req,res) => {
    try {
        const a=await Profile.findOne({ user: req.user.id}).populate("user",
        ["name","avatar"]);
        

        if(!a){
            res.status(400).json({ msg: "There is no profile for this user"})
            return
        }
        res.json(a)
    }catch(err){
        console.error(err.message);
        res.status(500).send("server error")
    }
});


// @route   POST api/profile
// @desc    create or update user profile
// @access  private
router.post("/",auth, [
    check("status","status is required")
        .not()
        .isEmpty(),
    check("skills","skills are required")
        .not()
        .isEmpty()
],
async (req, res) => {
    const errors=validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
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
        linkedin
    } = req.body;

    // Build profile object
    const profilefields = {}
    profilefields.user=req.user.id;
    if(company) profilefields.company = company;
    if(website) profilefields.website = website;
    if(location) profilefields.location = location;
    if(bio) profilefields.bio = bio;
    if(status) profilefields.status = status;
    if(githubusername) profilefields.githubusername = githubusername;

    if(skills) {
        profilefields.skills = skills.split(",").map(skill => skill.trim());
    }
    
    // build social object
    profilefields.social = {}
    if(youtube) profilefields.social.youtube = youtube;
    if(twitter) profilefields.social.twitter = twitter;
    if(facebook) profilefields.social.facebook = facebook;
    if(linkedin) profilefields.social.linkedin = linkedin;
    if(instagram) profilefields.social.instagram = instagram;

    try{
        let profile = await  Profile.findOne({ user: req.user.id});

        if(profile){
            // upadte
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id},
                { $set: profilefields },
                { new: true }
            );

            res.json(profile)
            return
        }

        // Create
        profile = new Profile(profilefields)

        await profile.save()
        res.json(profile);

    }catch(err) {
        console.log(err.message);
        res.status(500).send("Server Error")
    }

    

    // res.send("hello")   //for temperarly we are using a dummy 
});


// @route   GET api/profile
// @desc    Get all profiles
// @access  public
router.get("/", async(req,res) => {
    try{
        const profiles = await Profile.find().populate("user",["name","avatar"]);
        res.json(profiles)
    }catch (err) {
        console.log(err.profilefields)
        res.status(500).send("server Error")
    }
});

// @route   GET api/profile/user/user_id
// @desc    Get all profiles by user id
// @access  public
router.get("/user/:user_id", async(req,res) => {
    try{
        const profile = await Profile.findOne({ user: req.params.user_id }).populate("user",["name","avatar"]);

        if (!profile){
            res.status(400).json({ msg: "profile not found"})
            return
        }
        res.json(profile)
          
    }catch (err) {
        console.log(err.profilefields)
        if(err.kind === "objectId"){
            res.status(400).json({ msg: "profile not found"})
            return
        }
        res.status(500).send("server Error")
    }
}); 

// @route   DELETE api/profile 
// @desc    Delete profile,user & posts
// @access  private
router.delete("/", auth ,async(req,res) => {
    try{
        // todo remove posts

        // Remove profile
        await Profile.findOneAndRemove({ user: req.user.id});

         // Remove user
        await User.findOneAndRemove({ _id: req.user.id});


        res.json({ msg:"user deleted"})
    }catch (err) {
        console.log(err.profilefields)
        res.status(500).send("server Error")
    }
});

// @route   Put api/profile/experience
// @desc    Add profile experience
// @access  private
router.put("/experience",auth,[
    check("title","title is required")
    .not()
    .isEmpty(),
    check("company","company is required")
        .not()
        .isEmpty(),
    check("from","from date is required")
        .not()
        .isEmpty()
], 
async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({ errors:errors.array() });
        return
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try{
        const profile = await Profile.findOne({ user: req.user.id});

        if (!profile){
            res.status(404).send("For this user profile is not there")
            return
        }

        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile)
    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error")
    }
});

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  private

router.delete('/experience/:exp_id',auth,async(req,res) => {
    try{
        const profile = await  Profile.findOne({ user: req.user.id })

        // Get remove index
        const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1)

        await profile.save();

        res.json(profile)


    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error")
    }
})

// @route   Put api/profile/education
// @desc    Add profile education Error")
// @access  private
router.put('/education',auth,[
    check("school","School is required")
    .not()
    .isEmpty(),
    check("degree","Degree is required")
        .not()
        .isEmpty(),
    check("fieldofstudy","Fieldofstudy date is required")
    .not()
    .isEmpty(),
    check("from","From date is required")
    .not()
    .isEmpty()
], 
async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({ errors: errors.array() });
        return
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try{
        const profile = await Profile.findOne({ user: req.user.id});

        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile)
    }catch(err){
        console.error(err.message)
        res.status(500).send("server Error");
    }
})

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  private

router.delete('/education/:edu_id',auth,async(req,res) => {
    try{
        const profile = await  Profile.findOne({ user: req.user.id })

        // Get remove index
        const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex,1)

        await profile.save();

        res.json(profile)


    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error")
    }
});

// @route   Get api/profile/github/:username
// @desc    Get user repos from github
// @access  public
router.get("/github/:username",(req,res) => {
    try{
        const options = {
            uri: `https://api.github.com/users/${
                req.params.username
            }/repos?per_page=5&sort=created:asc&cliend_id=${config.get(
                "githubClientId"
            )}&client_secret=${config.get("githubSecret")}`,
            method: "GET",
            headers: { "user-agent": "node.js"}
        }

        request(options, (error, response, body) => {
            if(error) console.error(error);

            if(response.statusCode !== 200){
                res.status(404).json({ msg: "No Github profile found"})
                return
            }

            res.json(JSON.parse(body))
        })
    }catch(err){
        console.error(err.message)
        res.status(500).send("server error");
    }
})



module.exports=router;