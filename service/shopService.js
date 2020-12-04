const { userTable, storeTable, productTable } = require('../database/db');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { Op } = require("sequelize");

exports.listShopsGET = async function (startId = 1, amount = 0) {
    let storeList = await storeTable.findAll({ where: { id: { [Op.between]: [startId, startId + amount - 1] } } });
    if (storeList) {
        let finalyFilterListStore = [];
        storeList.forEach(element => {
            element = element.dataValues;
            finalyFilterListStore.push({
                id: element.id,
                name: element.name,
                info: element.info,
                price: element.categories,
                store: element.admin,
                image: element.image
            });
        });
        return ({ response: { status: "ok", data: finalyFilterListStore } });
    } else {
        return ({ response: { status: "false", info: "Cant find store record." } });
    }
}

async function savePhoto(image) {
    let creatingPath = [];
    if (image) {
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
        return `${path.join(...creatingPath)}.jpg`;
    } else {
        return false;
    }
}

exports.createShopPOST = async function (token, image = false, nameShop, information, category, double) {
    let admin = await verification(token, double, true);
    if (admin) {
        if (nameShop.length && nameShop.length > 30) {
            return ({ response: { status: "error", info: "Please send correct name." } });
        }
        if (await storeTable.count({ where: { name: nameShop } }) > 0) {
            return ({ response: { status: "error", info: "This name shops is exist." } });
        }
        if (information.length && information.length > 512) {
            return ({ response: { status: "error", info: "Please send correct information." } });
        }
        if (category.length && category.split(",").length < 1) {
            return ({ response: { status: "error", info: "Please send correct category." } });
        }
        let newImage = await savePhoto(image);
        let newStore = await storeTable.create({
            name: nameShop,
            info: information,
            categories: category,
            image: newImage ? newImage : null,
            admin: admin.id,
        });
        if (newStore) {
            return ({ response: { status: "ok", info: "Shop is create.", id: newStore.dataValues.id } });
        } else {
            return ({ response: { status: "error", info: "Error create." } });
        }
    } else {
        return ({ response: { status: "error", info: "No auth." } });
    }
}

exports.updateShopPOST = async function (idShop, token, image = false, nameShop = false, information = false, category = false, double) {
    let admin = await verification(token, double, true);
    if (admin) {
        if (nameShop.length && nameShop.length > 30) {
            return ({ response: { status: "error", info: "Please send correct name." } });
        }
        if (await storeTable.count({ where: { name: nameShop } }) > 0) {
            return ({ response: { status: "error", info: "This name shops is exist." } });
        }
        if (information.length && information.length > 512) {
            return ({ response: { status: "error", info: "Please send correct information." } });
        }
        if (category.length && category.split(",").length < 1) {
            return ({ response: { status: "error", info: "Please send correct category." } });
        }
        let newImage = await savePhoto(image);
        let updateShop = await storeTable.findOne({ where: { id: idShop, admin: admin.id } });
        if (updateShop) {
            if (nameShop) { updateShop.name = nameShop; }
            if (information) { updateShop.info = information; }
            if (category) { updateShop.categories = category; }
            if (newImage) {
                fs.unlinkSync(path.join(__dirname, "..", "source", updateShop.image));
                updateShop.image = newImage;
            }
            updateShop.save();
            return ({ response: { status: "ok", info: "Update shops." } });
        } else {
            return ({ response: { status: "error", info: "Cant find this shops." } });
        }
    } else {
        return ({ response: { status: "error", info: "No auth." } });
    }
}

exports.shopDELETE = async function (shop, token, double) {
    let access = await verification(token, double, true);
    if (access) {
        if (isNaN(shop)) {
            return ({ response: { status: "error", info: "This id is incorrect." } });
        }
        let storeReturn = await storeTable.findOne({ where: { id: parseInt(shop), admin: access.id } });
        if (storeReturn) {
            let productReturn = await productTable.findAll({ where: { store: storeReturn.dataValues.id } });
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
        let request = await userTable.findOne({ where: { token, double } });
        if (confirm) {
            return request.dataValues.smail ? false : request.dataValues;
        } else {
            return request.dataValues;
        }
    }
    return false;
}
