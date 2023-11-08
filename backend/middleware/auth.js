const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.isAuthenticated=async(req, res, next)=>{
    const {token} = req.cookies;
    
    if(!token){
        res.satus(401).json('please login to access this resource');
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);
}