const { users, store, product, star } = require('../database/db');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { Op, fn, col } = require("sequelize");

exports.apiCreateProductTokenPOST = async function (token, nameProduct, information, category, price, double, storeID, image_1, image_2, image_3, edit) {
    let admin = await verification(token, double, true);
    if (admin.id) {
        let owner = await store.findOne({ where: { id: storeID } });
        if (owner) {
            if (owner.dataValues.admin != admin.id) {
                return ({ response: { status: "error", info: "You are not an administrator." } });
            }
            if (nameProduct.length && nameProduct.length > 30 && !edit) {
                return ({ response: { status: "error", info: "Please send correct name." } });
            }
            if (information.length && information.length > 512) {
                return ({ response: { status: "error", info: "Please send correct information." } });
            }
            if (category.length && category.split(",").length < 1) {
                return ({ response: { status: "error", info: "Please send correct category." } });
            }
            if (!RegExp(/^[\d]+$/).exec(price)) {
                return ({ response: { status: "error", info: "Please send correct price." } });
            }
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
                }
            });
            if (edit) {
                return editProduct(nameProduct, storeID, category, information, price, pathArray);
            } else {
                let request = await product.create({
                    category, store: storeID,
                    name: nameProduct,
                    info: information, price,
                    image1: pathArray[0] ? pathArray[0] : null,
                    image2: pathArray[1] ? pathArray[1] : null,
                    image3: pathArray[2] ? pathArray[2] : null
                });
                if (request) {
                    return ({ response: { status: "ok", info: "Product is create." } });
                } else {
                    return ({ response: { status: "error", info: "Error create." } });
                }
            }
        } else {
            return ({ response: { status: "error", info: "This shop is not exist." } });
        }
    }
    return ({ response: { status: "error", info: "No auth." } });
}

async function editProduct(nameProduct, storeID, category, information, price, pathArray) {
    if (!parseInt(nameProduct)) {
        return ({ response: { status: "false", info: "Bad parse int id." } });
    }
    let updateProduct = await product.findOne({ where: { id: parseInt(nameProduct) } });
    if (updateProduct) {
        if (storeID) { updateProduct.store = storeID; }
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
        return ({ response: { status: "error", info: "Cant find this product." } });
    }
}

exports.apiGetProductTokenStartIdAmountGET = async function (token, startId = 1, amount = 0, word = false) {
    let response = await users.findOne({ where: { token } });
    amount = (amount > 20 ? 20 : amount);
    if (response) {
        let data = undefined;
        if (word) {
            data = await product.findAll({
                where: {
                    id: {
                        [Op.between]: [parseInt(startId), parseInt(startId) + parseInt(amount) - 1]
                    },
                    name: { [Op.like]: `%${word}%` }
                }
            });
        } else {
            data = await product.findAll({ where: { id: { [Op.between]: [parseInt(startId), parseInt(startId) + parseInt(amount) - 1] } } });
        }
        if (data) {
            let answert = [];
            data.forEach(element => {
                element = element.dataValues;
                answert.push({
                    id: element.id,
                    name: element.name,
                    info: element.info,
                    price: element.price,
                    store: element.store,
                    image: element.image1
                });
            });
            return ({ response: { status: "ok", wordRequest: word ? word : "This params is empty", data: answert } });
        }
    }
    return ({ response: { status: "error", info: "No auth." } });
}

exports.ratingProductGET = async function (token, product) {
    let response = await users.findOne({ where: { token } });
    if (response) {
        let rating = await star.findOne({
            where: { product: parseInt(product) }, attributes: {
                include: [[fn('AVG', col('rating')), 'avg']]
            }
        });
        return ({ response: { status: "ok", rating: rating.dataValues['avg'], productId: product } });
    }
    return ({ response: { status: "error", info: "No auth." } });
}

exports.ratingProductPOST = async function (body, token) {
    let rating = body.rating;
    let product = body.product;
    let response = await users.findOne({ where: { token } });
    if (response) {
        if (isNaN(rating) || parseInt(rating) < 1 || parseInt(rating) > 5) {
            return ({ response: { status: "error", info: "Plese set number from 1 to 5." } });
        }
        if (isNaN(product)) {
            return ({ response: { status: "error", info: "Plese set correct product id." } });
        }
        let oldStar = await star.findOne({ where: { product: parseInt(product), author: response.dataValues.id } });
        if (oldStar) {
            oldStar.rating = parseInt(rating);
            oldStar.save();
        } else {
            await star.create({
                rating: parseInt(rating),
                product: parseInt(product),
                author: response.dataValues.id
            });
        }
        return ({ response: { status: "ok" } });
    }
    return ({ response: { status: "error", info: "No auth." } });
}

exports.productDELETE = async function (productLocal, token, double) {
    let request = await verification(token, double, true);
    if (request) {
        if (isNaN(productLocal)) {
            return ({ response: { status: "error", info: "This id is incorrect." } });
        }
        let productRequest = await product.findOne({ where: { id: parseInt(productLocal) } });
        if (productRequest) {
            let storeReturn = await store.findOne({ where: { id: productRequest.dataValues.store, admin: request.id } });
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
        let request = await users.findOne({ where: { token, double } });
        if (confirm) {
            return request.dataValues.smail ? false : request.dataValues;
        } else {
            return request.dataValues;
        }
    }
    return false;
}
