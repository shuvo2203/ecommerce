const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const sendEmail=async(options)=>{
    const transporter = nodemailer.createTransport(smtpTransport({
        host:"smtp.gmail.com",
        service:process.env.SMTP_SERVICE,
        auth:{
            mail:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASS
        }
    }));
    const mailOptions = {
        from:process.env.SMTP_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message
    }
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;