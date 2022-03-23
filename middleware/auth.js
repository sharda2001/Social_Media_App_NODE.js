const jwt = require("jsonwebtoken")
const config=require("config")

module.exports = function(req,res,next){
    // Get token from header
    const token = req.header("x-auth-token");  // x-auth-token header key,send along with the token

    // check if not token
    if(!token) {
        res.status(401).json({ msg: "No token, authorization denied"})
        return

    }

    // verify tokenn 
    try {
        const decoded = jwt.verify(token, config.get("jwtSecret"))
        req.user=decoded.user;
        next();
    }catch(err){
        res.status(401).json({ msg: "Token is not valid" })
    }
}

