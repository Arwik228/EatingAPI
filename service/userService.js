const { userTable, storeTable, authTable } = require('../database/db');
const { createAccount, resetPassword } = require('../mail/confirm');
const { fn } = require("sequelize");
const crypto = require('crypto');

exports.createAccountPOST = async function (body) {
    if (!RegExp(/^([\w.*-]+@([\w-]+\.)+[\w-]{2,4})?$/).test(body.email)) {
        return ({ response: { status: "error", info: "No valid email." } });
    }
    if (!RegExp(/(?=^.{9,}$)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9])/).test(body.password)) {
        return ({ response: { status: "error", info: "Bad password, please send correct password." } });
    }
    if (!RegExp(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/).test(body.number)) {
        return ({ response: { status: "error", info: "Please send correct number." } });
    }
    if (body.firstname.length && body.firstname.length > 20) {
        return ({ response: { status: "error", info: "Please send correct firstname." } });
    }
    if (body.lastname.length && body.lastname.length > 20) {
        return ({ response: { status: "error", info: "Please send correct lastname." } });
    }
    if (await userTable.count({ where: { email: body.email } })) {
        return ({ response: { status: "error", info: "This email yet registration." } });
    }
    let double = String(Math.random()).split('.')[1].slice(0, 10);
    let token = crypto.pbkdf2Sync(body.email + Date.now() + Math.random(), 'salt', 100000, 64, 'sha512').toString('hex');
    let smail = crypto.pbkdf2Sync(body.email, 'salt', 100000, 64, 'sha512').toString('hex')
    let confirmCreateAccount = await userTable.create({
        double, token, smail,
        email: body.email,
        number: body.number.replace('+', ''),
        firstname: body.firstname,
        lastname: body.lastname,
        hash: crypto.pbkdf2Sync(body.password, 'salt', 100000, 64, 'sha512').toString('hex')
    });
    createAccount(body.email, smail);
    if (confirmCreateAccount) {
        return ({ response: { status: "ok", info: "Create new account.", access: { token, double } } });
    }
}

exports.emailAuthPUT = async function (body) {
    let thisAccountIsExist = await userTable.findOne({ where: { email: body.email } });
    if (thisAccountIsExist) {
        let newHash = crypto.pbkdf2Sync(body.password, 'salt', 100000, 64, 'sha512').toString('hex');
        if (thisAccountIsExist.dataValues.hash === newHash) {
            let double = String(Math.random()).split('.')[1].slice(0, 10);
            let token = crypto.pbkdf2Sync(thisAccountIsExist.dataValues.email + Date.now() + Math.random(), 'salt', 100000, 64, 'sha512').toString('hex');
            authInformation({ double, user: thisAccountIsExist.id, platforma: body.platforma, device: body.device, ip: body.ip });
            thisAccountIsExist.token = token;
            thisAccountIsExist.double = double;
            thisAccountIsExist.save();
            return ({ response: { status: "ok", info: "You auth.", access: { token, double } } });
        } else {
            return ({ response: { status: "error", info: "Bad password." } });
        }
    }
    return ({ response: { status: "error", info: "No valid data." } });
}

exports.resetPasswordGET = async function (email) {
    let user = await userTable.findOne({ where: { email } });
    if (user) {
        let createNewUserPassword = "";
        var symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!%?*()_+=";
        for (var i = 0; i < 8; i++) {
            createNewUserPassword += symbols.charAt(Math.floor(Math.random() * symbols.length));
        }
        let newHashPassword = crypto.pbkdf2Sync(createNewUserPassword, 'salt', 100000, 64, 'sha512').toString('hex');
        user.hash = newHashPassword;
        user.online = fn('NOW');
        user.save();
        resetPassword(email, createNewUserPassword);
    } else {
        return ({ response: { status: "error", info: "Cant find this email." } });
    }
}

exports.emailStatusGET = async function (email) {
    if (email) {
        let count = await userTable.count({ where: { email: email } })
        if (count) {
            return ({ response: { status: "error", info: "This email yet registration." } });
        } else {
            return ({ response: { status: "ok", info: "This can registration." } });
        }
    } else {
        return ({ response: { status: "error", info: "Please send email data." } });
    }
}

exports.userDataGET = async function (token) {
    let user = await userTable.findOne({ where: { token } });
    if (user) {
        let { id, email, number, firstname, lastname, createdAt } = user;
        let stores = await storeTable.findAll({ where: { admin: id } });
        let storesFilter = [];
        stores.forEach(element => {
            storesFilter.push({
                id: element.dataValues.id,
                name: element.dataValues.name,
                image: element.dataValues.images,
                admin: element.dataValues.admin,
            });
        });
        return ({ response: { status: "ok", data: { id, email, number, firstname, lastname, createdAt, stores: storesFilter } } });
    }
    return ({ response: { status: "error", info: "No valid token." } });
}

exports.updateUserPUT = async function (token, body) {
    let user = await userTable.findOne({ where: { token } });
    if (user) {
        if (body.password) {
            if (!RegExp(/(?=^.{9,}$)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9])/).test(body.password)) {
                return ({ response: { status: "error", info: "Bad password, please send correct password." } });
            }
            user.hash = crypto.pbkdf2Sync(body.password, 'salt', 100000, 64, 'sha512').toString('hex');
            user.save();
        }

        if (body.number) {
            if (!RegExp(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/).test(body.number)) {
                return ({ response: { status: "error", info: "Please send correct number." } });
            }
            user.number = body.number.replace('+', '');
            user.save();
        }

        if (body.firstname) {
            if (body.firstname.length && body.firstname.length > 20) {
                return ({ response: { status: "error", info: "Please send correct firstname." } });
            }
            user.firstname = body.firstname;
            user.save();
        }

        if (body.lastname) {
            if (body.lastname.length && body.lastname.length > 20) {
                return ({ response: { status: "error", info: "Please send correct lastname." } });
            }
            user.lastname = body.lastname;
            user.online = fn('NOW');
            user.save();
        }
        return ({ response: { status: "ok" } });
    }
    return ({ response: { status: "error", info: "No auth." } });
}

exports.emailActiveGET = async function (smail) {
    if (smail.length == 128) {
        let user = await userTable.findOne({ where: { smail } });
        if (user && user.dataValues.id > 0) {
            user.smail = "";
            user.online = fn('NOW');
            user.save();
            return ({ response: { status: "ok" } });
        } else {
            return ({ response: { status: "error", info: "Cant find key." } });
        }
    } else {
        return ({ response: { status: "error", info: "Bad mail key." } });
    }
}

async function authInformation(object) {
    authTable.create({
        user: object.user,
        double: object.double,
        platforma: object.platforma,
        device: object.device,
        ip: object.ip
    });
}
