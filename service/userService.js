const { users, store, auth } = require('../database/db');
const { createAccount } = require('./mail/mail');
const crypto = require('crypto');

exports.apiCreateAccountPOST = async function (body) {
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
    if (await users.count({ where: { email: body.email } })) {
        return ({ response: { status: "error", info: "This email yet registration." } });
    }
    let double = String(Math.random()).split('.')[1].slice(0, 10);
    let token = crypto.pbkdf2Sync(body.email + Date.now() + Math.random(), 'salt', 100000, 64, 'sha512').toString('hex');
    let smail = crypto.pbkdf2Sync(body.email, 'salt', 100000, 64, 'sha512').toString('hex')
    let request = await users.create({
        double, token, smail,
        email: body.email,
        number: body.number.replace('+', ''),
        firstname: body.firstname,
        lastname: body.lastname,
        hash: crypto.pbkdf2Sync(body.password, 'salt', 100000, 64, 'sha512').toString('hex')
    });
    createAccount(body.email, smail);
    console.warn(`Activate account: http://127.0.0.1:8080/api/emailActive/${smail}`);
    if (request) {
        return ({ response: { status: "ok", info: "Create new account.", access: { token, double } } });
    }
}

exports.apiEmailAuthPUT = async function (body) {
    let request = await users.findOne({ where: { email: body.email } });
    if (request) {
        let newHash = crypto.pbkdf2Sync(body.password, 'salt', 100000, 64, 'sha512').toString('hex');
        if (request.dataValues.hash === newHash) {
            let double = String(Math.random()).split('.')[1].slice(0, 10);
            let token = crypto.pbkdf2Sync(request.dataValues.email + Date.now() + Math.random(), 'salt', 100000, 64, 'sha512').toString('hex');
            authInformation({ double, user: request.id, platforma: body.platforma, device: body.device, ip: body.ip });
            request.token = token;
            request.double = double;
            request.save();
            return ({ response: { status: "ok", info: "You auth.", access: { token, double } } });
        }
    }
    return ({ response: { status: "error", info: "No valid data." } });
}

exports.apiEmailStatusGET = async function (email) {
    if (email) {
        let count = await users.count({ where: { email: email } })
        if (count) {
            return ({ response: { status: "error", info: "This email yet registration." } });
        } else {
            return ({ response: { status: "ok", info: "This can registration." } });
        }
    } else {
        return ({ response: { status: "error", info: "Please send email data." } });
    }
}

exports.apiGetUserDataTokenGET = async function (token) {
    let response = await users.findOne({ where: { token } });
    if (response) {
        let { id, email, number, firstname, lastname, createdAt } = response;
        let stores = await store.findAll({ where: { admin: id } });
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

exports.apiUpdateDataTokenPUT = async function (token, body) {
    let response = await users.findOne({ where: { token } });
    if (response) {
        if (body.password) {
            if (!RegExp(/(?=^.{9,}$)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9])/).test(body.password)) {
                return ({ response: { status: "error", info: "Bad password, please send correct password." } });
            }
            response.hash = crypto.pbkdf2Sync(body.password, 'salt', 100000, 64, 'sha512').toString('hex');
            response.save();
        }

        if (body.number) {
            if (!RegExp(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/).test(body.number)) {
                return ({ response: { status: "error", info: "Please send correct number." } });
            }
            response.number = body.number.replace('+', '');
            response.save();
        }

        if (body.firstname) {
            if (body.firstname.length && body.firstname.length > 20) {
                return ({ response: { status: "error", info: "Please send correct firstname." } });
            }
            response.firstname = body.firstname;
            response.save();
        }

        if (body.lastname) {
            if (body.lastname.length && body.lastname.length > 20) {
                return ({ response: { status: "error", info: "Please send correct lastname." } });
            }
            response.lastname = body.lastname;
            response.save();
        }

        return ({ response: { status: "ok" } });
    }
    return ({ response: { status: "error", info: "No auth." } });
}

exports.emailActiveGet = async function (smail) {
    if (smail.length == 128) {
        let request = await users.findOne({ where: { smail } });
        if (request && request.dataValues.id > 0) {
            request.smail = "";
            request.save();
            return ({ response: { status: "ok" } });
        } else {
            return ({ response: { status: "error", info: "Cant find key." } });
        }
    } else {
        return ({ response: { status: "error", info: "Bad mail key." } });
    }
}

async function authInformation(object) {
    auth.create({
        user: object.user,
        double: object.double,
        platforma: object.platforma,
        device: object.device,
        ip: object.ip
    });
}