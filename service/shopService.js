const { users, store, product } = require('../database/db');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { Op } = require("sequelize");
const e = require('express');

exports.apiGetShopsTokenStartIdAmountGET = async function (token, startId = 1, amount = 0) {
    let response = await users.findOne({ where: { token } });
    amount = (amount > 20 ? 20 : amount)
    if (response) {
        let data = await store.findAll({ where: { id: { [Op.between]: [parseInt(startId), parseInt(startId) + parseInt(amount) - 1] } } });
        if (data) {
            let answert = [];
            data.forEach(element => {
                element = element.dataValues;
                answert.push({
                    id: element.id,
                    name: element.name,
                    info: element.info,
                    price: element.categories,
                    store: element.admin,
                    image: element.image
                });
            });
            return ({ response: { status: "ok", data: answert } });
        }
    }
    return ({ response: { status: "error", info: "No auth." } });
}

exports.apiCreateShopsTokenPOST = async function (token, image, nameShop, information, category, double, edit) {
    let admin = await verification(token, double, true);
    if (admin) {
        if (nameShop.length && nameShop.length > 30) {
            return ({ response: { status: "error", info: "Please send correct name." } });
        }
        if (await store.count({ where: { name: nameShop } }) > 0 && !edit) {
            return ({ response: { status: "error", info: "This name shops is exist." } });
        }
        if (information.length && information.length > 512) {
            return ({ response: { status: "error", info: "Please send correct information." } });
        }
        if (category.length && category.split(",").length < 1) {
            return ({ response: { status: "error", info: "Please send correct category." } });
        }
        let creatingPath = [];
        if (image.size > 16) {
            let hashPath = crypto.pbkdf2Sync(String(Date.now() + Math.random()), 'salt', 100000, 64, 'sha512').toString('hex');
            creatingPath = [hashPath.slice(0, 2), hashPath.slice(2, 6), hashPath.slice(6, 16), hashPath.slice(16, 26)];
            let basePath = path.join(__dirname, "..", "source");
            for (let i = 0; i < 3; i++) {
                basePath = path.join(basePath, creatingPath[i]);
                if (!fs.existsSync(basePath)) {
                    fs.mkdirSync(basePath, '777', true);
                }
            }
            fs.writeFileSync(path.join(basePath, `${creatingPath[3]}.jpg`), image.buffer, 'binary');
        }
        if (edit) {
            return editShop(admin, nameShop, information, category, creatingPath);
        } else {
            let request = await store.create({
                name: nameShop,
                info: information,
                categories: category,
                image: creatingPath.length > 0 ? `${path.join(...creatingPath)}.jpg` : null,
                admin: admin.id,
            });
            if (request) {
                return ({ response: { status: "ok", info: "Shop is create.", id: request.dataValues.id } });
            } else {
                return ({ response: { status: "error", info: "Error create." } });
            }
        }
    } else {
        return ({ response: { status: "error", info: "No auth." } });
    }
}

async function editShop(admin, nameShop, information, category, creatingPath) {
    if (isNaN(nameShop)) {
        return ({ response: { status: "error", info: "Please send nameShop integer." } });
    }
    let updateShop = await store.findOne({ where: { id: parseInt(nameShop), admin: admin.id } });
    if (updateShop) {
        if (information) { updateShop.info = information; }
        if (category) { updateShop.categories = category; }
        if (creatingPath.length > 0) {
            fs.unlinkSync(path.join(__dirname, "..", "source", updateShop.image));
            updateShop.image = `${path.join(...creatingPath)}.jpg`;
        }
        updateShop.save();
        return ({ response: { status: "ok", info: "Update shops." } });
    } else {
        return ({ response: { status: "error", info: "Cant find this shops." } });
    }
}

exports.shopDELETE = async function (shop, token, double) {
    let request = await verification(token, double, true);
    if (request) {
        if (isNaN(shop)) {
            return ({ response: { status: "error", info: "This id is incorrect." } });
        }
        let storeReturn = await store.findOne({ where: { id: parseInt(shop), admin: request.id } });
        if (storeReturn) {
            let productReturn = await product.findAll({ where: { store: storeReturn.dataValues.id } });
            productReturn.forEach(element => {
                element.destroy();
            });
            storeReturn.destroy();
            return ({ response: { status: "ok", info: "This shop is delete" } });
        } else {
            return ({ response: { status: "error", info: "Cant find shop" } });
        }
    } else {
        return ({ response: { status: "error", info: "No auth." } });
    }
}

async function verification(token, double, confirm) {
    if (token.length === 128 && double.length === 10) {
        let request = await users.findOne({ where: { token, double } });
        if (confirm) {
            return request.dataValues.smail ? false : request.dataValues;
        } else {
            return request.dataValues;
        }
    }
    return false;
}
