const { userTable, storeTable, productTable, starTable } = require('../database/db');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { Op, fn, col } = require("sequelize");
const e = require('express');

async function savesPhoto(image_1, image_2, image_3) {
    let pathArray = [];
    [image_1, image_2, image_3].forEach(element => {
        if (element) {
            let hashPath = crypto.pbkdf2Sync(String(Date.now() + Math.random()), 'salt', 100000, 64, 'sha512').toString('hex');
            let creatingPath = [hashPath.slice(0, 2), hashPath.slice(2, 6), hashPath.slice(6, 16), hashPath.slice(16, 26)];
            let basePath = path.join(__dirname, "..", "source");
            for (let i = 0; i < 3; i++) {
                basePath = path.join(basePath, creatingPath[i]);
                if (!fs.existsSync(basePath)) {
                    fs.mkdirSync(basePath, '777', true);
                }
            }
            fs.writeFileSync(path.join(basePath, `${creatingPath[3]}.jpg`), element.buffer, 'binary');
            pathArray.push(`${path.join(...creatingPath)}.jpg`);
        } else {
            pathArray.push(false);
        }
    });
    return pathArray;
}

exports.createProductPOST = async function (token, nameProduct, information, category, price, double, storeID, image_1, image_2, image_3) {
    let admin = await verification(token, double, true);
    if (admin) {
        let issetStore = await storeTable.findOne({ where: { id: storeID } });
        if (issetStore) {
            if (issetStore.dataValues.admin != admin.id) {
                return ({ response: { status: "error", info: "You are not an administrator." } });
            }
            if (nameProduct.length && nameProduct.length > 30) {
                return ({ response: { status: "error", info: "Please send correct name." } });
            }
            if (information.length && information.length > 512) {
                return ({ response: { status: "error", info: "Please send correct information." } });
            }
            if (category.length && category.split(",").length < 1) {
                return ({ response: { status: "error", info: "Please send correct category." } });
            }
            if (!RegExp(/^[\d]+$/).exec(price) || !Number.isInteger(price)) {
                return ({ response: { status: "error", info: "Please send correct price." } });
            }
            let pathArray = savesPhoto(image_1, image_2, image_3);
            let product = await productTable.create({
                category, store: storeID,
                name: nameProduct,
                info: information, price,
                image1: pathArray[0] ? pathArray[0] : null,
                image2: pathArray[1] ? pathArray[1] : null,
                image3: pathArray[2] ? pathArray[2] : null
            });
            if (product) {
                return ({ response: { status: "ok", info: "Product is create." } });
            } else {
                return ({ response: { status: "error", info: "Error create." } });
            }
        } else {
            return ({ response: { status: "error", info: "This shop is not exist." } });
        }
    }
    return ({ response: { status: "error", info: "No auth." } });
}

exports.updateProductPOST = async function (token, nameProduct = false, information = false, category = false, price = false, double, productID, image_1, image_2, image_3) {
    let admin = await verification(token, double, true);
    if (admin) {
        let updateProduct = await productTable.findOne({ where: { id: productID } });
        if (updateProduct) {
            let storeConfirm = await storeTable.findOne({ where: { id: updateProduct.dataValues.store } });
            if (storeConfirm) {
                if (storeConfirm.dataValues.admin != admin.id) {
                    return ({ response: { status: "error", info: "You are not an administrator." } });
                }
                if (nameProduct && nameProduct.length > 30) {
                    return ({ response: { status: "error", info: "Please send correct name." } });
                }
                if (information && information.length > 512) {
                    return ({ response: { status: "error", info: "Please send correct information." } });
                }
                if (category && category.split(",").length < 1) {
                    return ({ response: { status: "error", info: "Please send correct category." } });
                }
                if (price && (!RegExp(/^[\d]+$/).exec(price) || !Number.isInteger(price))) {
                    return ({ response: { status: "error", info: "Please send correct price." } });
                }
                let pathArray = savesPhoto(image_1, image_2, image_3);
                if (nameProduct) { updateProduct.name = nameProduct; }
                if (category) { updateProduct.category = category; }
                if (information) { updateProduct.info = information; }
                if (price) { updateProduct.price = price; }
                if (pathArray[0]) {
                    fs.unlinkSync(path.join(__dirname, "..", "source", updateProduct.image1));
                    updateProduct.image1 = pathArray[0];
                }
                if (pathArray[1]) {
                    fs.unlinkSync(path.join(__dirname, "..", "source", updateProduct.image2));
                    updateProduct.image2 = pathArray[1];
                }
                if (pathArray[2]) {
                    fs.unlinkSync(path.join(__dirname, "..", "source", updateProduct.image3));
                    updateProduct.image3 = pathArray[2];
                }
                updateProduct.save();
                return ({ response: { status: "ok", info: "Update product." } });
            } else {
                return ({ response: { status: "error", info: "This shop is not exist." } });
            }
        } else {
            return ({ response: { status: "error", info: "Cant find this product." } });
        }
    } else {
        return ({ response: { status: "error", info: "No auth." } });
    }
}

exports.listProductsGET = async function (startId = 1, amount = 0, searchWord = false) {
    amount = (amount > 20 ? 20 : amount);
    let listProduct = "";
    if (searchWord) {
        listProduct = await productTable.findAll({
            where: {
                id: {
                    [Op.between]: [startId, startId + amount - 1]
                },
                name: { [Op.like]: `%${searchWord}%` }
            }
        });
    } else {
        listProduct = await product.findAll({ where: { id: { [Op.between]: [startId, startId + amount - 1] } } });
    }
    if (listProduct) {
        let returnFilterList = [];
        listProduct.forEach(element => {
            element = element.dataValues;
            returnFilterList.push({
                id: element.id,
                name: element.name,
                info: element.info,
                price: element.price,
                store: element.store,
                image: element.image1
            });
        });
        return ({ response: { status: "ok", wordRequest: searchWord ? searchWord : "This params is empty", data: returnFilterList } });
    } else {
        return ({ response: { status: "error", info: "This response is faild." } });
    }
}

exports.ratingProductGET = async function (token, product) {
    let confirm = await userTable.findOne({ where: { token } });
    if (confirm) {
        let rating = await starTable.findOne({
            where: { product }, attributes: {
                include: [[fn('AVG', col('rating')), 'avg']]
            }
        });
        return ({ response: { status: "ok", rating: rating.dataValues['avg'], productId: product } });
    }
    return ({ response: { status: "error", info: "No auth." } });
}

exports.ratingProductPOST = async function (body, token) {
    let confirm = await userTable.findOne({ where: { token } });
    if (confirm) {
        if (body.rating && (body.rating < 1 || body.rating > 5)) {
            return ({ response: { status: "error", info: "Plese set number from 1 to 5." } });
        }
        if (isNaN(body.product)) {
            return ({ response: { status: "error", info: "Plese set correct product id." } });
        }
        let oldStar = await starTable.findOne({ where: { product: body.product, author: confirm.dataValues.id } });
        if (oldStar) {
            oldStar.rating = body.rating;
            oldStar.save();
        } else {
            await starTable.create({
                rating: body.rating,
                product: body.product,
                author: confirm.dataValues.id
            });
        }
        return ({ response: { status: "ok" } });
    }
    return ({ response: { status: "error", info: "No auth." } });
}

exports.productDELETE = async function (productLocal, token, double) {
    let confirm = await verification(token, double, true);
    if (confirm) {
        if (isNaN(productLocal)) {
            return ({ response: { status: "error", info: "This id is incorrect." } });
        }
        let productRequest = await productTable.findOne({ where: { id: parseInt(productLocal) } });
        if (productRequest) {
            let storeReturn = await storeTable.findOne({ where: { id: productRequest.dataValues.store, admin: confirm.id } });
            if (storeReturn) {
                productRequest.destroy();
                return ({ response: { status: "ok", info: "Product delete." } });
            } else {
                return ({ response: { status: "error", info: "No permission." } });
            }
        } else {
            return ({ response: { status: "error", info: "Cant find product." } });
        }
    } else {
        return ({ response: { status: "error", info: "No auth." } });
    }

}

async function verification(token, double, confirm) {
    if (token.length === 128 && double.length === 10) {
        let request = await userTable.findOne({ where: { token, double } });
        if (request) {
            if (confirm) {
                return request.dataValues.smail ? false : request.dataValues;
            } else {
                return request.dataValues;
            }
        } else {
            return false;
        }
    }
    return false;
}
