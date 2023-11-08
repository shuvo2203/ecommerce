const User = require('../models/userModel');
// const sendToken = require('../utils/jwtTokens');


//register a user
exports.registerUser = async(req, res)=>{
    const { name, email, password,  } = req.body;

    const user = await User.create({
        name, email, password,
        avatar:{
            public_id:'sample public id',
            url:'profile picture'
        }
    })
    const token = user.getJWTToken();

    res.cookie('token', token);

    res.status(201).json({
        success:true,
        token
    });
}

//login user
exports.loginUser =async(req, res)=>{
    const{email, password} = req.body;
    if(!email || !password){
        res.status(400).json('please fillout all fields');
    }

    const user = await User.findOne({email}).select('+password');

    if(!user){
        res.status(400).json('user not found');
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        res.status(400).json('invalid email or password');
    }

    const token = user.getJWTToken();

    res.cookie('token', token);

    res.status(201).json({
        success:true,
        token
    });
}