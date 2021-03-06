const nodemailer = require('nodemailer');

const user = '';
const pass = '';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user, pass
    }
});

module.exports.createAccount = function (email, token) {
    console.log(`User token: ${token}`)
    let mailOptions = {
        from: user,
        to: email,
        subject: 'Confirm account',
        text: `This link is confirm email: http://127.0.0.1:8080/api/emailActive/${token}`
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports.resetPassword = function (email, newPassword) {
    console.log(`New password generate: ${newPassword}`)
    let mailOptions = {
        from: user,
        to: email,
        subject: 'Confirm account',
        text: `You password account is reseting password, new password: ${newPassword}\n You can change password in settings.`
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}