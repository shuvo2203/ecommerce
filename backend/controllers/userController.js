const User = require('../models/userModel');
// const sendToken = require('../utils/jwtTokens');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');


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


//logout user
exports.logout=async(req, res)=>{
    res.cookie('token', null,{
        expires:new Date(Date.now()),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        message:'logged successfully'
    });
}


//forgot password
exports.forgotPassword =async(req, res, next)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user){
        res.status(500).json('user not found');
    }
    //get reset password token
    const resetToken =  user.passwordToken();

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message = `your password reset token is :- \n\n ${resetPasswordUrl} \n\nif you are not requested this email 
    then, please ignore it`

    try {
        await sendEmail({
            email:user.email,
            subject:`Ecommerce password recovery`,
            message
        });
        res.status(200).json({
            success:true,
            message:`Email send to ${user.email} successfully`
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave:false});
        res.status(500).json(error);
        console.log(error)
    }
}

//reset paassword
exports.resetPassword=async(req, res, next)=>{
    //creating token hash
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    });
    if(!user){
        res.status(400).json('reset password token is invalid or has been expired');
    }
    if(req.body.password !== req.body.confirmPassword){
        res.status(400).json('password does not match');
    }
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save();

    const token = user.getJWTToken();

    res.cookie('token', token);

    res.status(201).json({
        success:true,
        token
    });
    
}


//get user details
exports.getUserDetails=async(req, res)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user
    });
}

//update user password
exports.updatePassword=async(req, res)=>{
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatched){
        res.status(400).json('email or password invalid');
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        res.status(400).json('password does not match');
    }
    user.password = req.body.newPassword;
    await user.save();

    const token = getJWTToken();
    res.cookie('token', token);

    res.status(200).json({
        success:true,
        token
    })
}

//update user profile
exports.updateProfile = async(req, res)=>{

    const newUserData={
        name:req.body.name,
        email:req.body.email
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new:true
    });
    res.status(200).json({
        success:true,
    });
}

//get all user
exports.getAllUser = async(req, res)=>{
    const users = await User.find();
    res.status(200).json({
        success:true,
        users
    });
}

//get single user --admin
exports.getUserDetail = async(req, res)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        res.status(400).json('user not found with this id');
    }
    res.status(200).json({
        success:true,
        user
    });
}