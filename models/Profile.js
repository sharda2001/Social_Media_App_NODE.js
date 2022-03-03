const mongoose=require('mongoose');

const profileSchema= new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    company:{

        type:String
    },
    website:{
        type:String
    },
    location:{
        type:String
    },
    status:{
        type:String,
        required:true
    },
    skills:{
        type:[String],
        required:true
    },
    bio:{
        type:String
    },
    githubsirname:{
        type:String
    },

});
