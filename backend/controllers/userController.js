const User = require('../models/userModel');
// const sendToken = require('../utils/jwtTokens');
const sendEmail = require('../utils/sendEmail');


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