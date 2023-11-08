const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.isAuthenticated=async(req, res, next)=>{
    const {token} = req.cookies;
    
    if(!token){
        res.status(401).json('please login to access this resource');
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);
    next();
}


exports.authorizeRoles=(...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            res.status(400).json(`role ${req.user.role} is not allowed to access this resource`);
        }
        next();
    }
}