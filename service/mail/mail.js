const nodemailer = require('nodemailer');

const user = '';
const pass = '';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user, pass
    }
});

module.exports.createAccount = function (token, email) {

    let mailOptions = {
        from: user,
        to: email,
        subject: 'Confirm account',
        text: `http://127.0.0.1:8080/api/emailActive/${token}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}