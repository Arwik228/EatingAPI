const { userTable, productTable, cartTable } = require('../database/db');
const { Op } = require("sequelize");

exports.myCartGet = async function (token, startId) {
    let user = await userTable.findOne({ where: { token } });
    if (user) {
        let returnFilterList = [];
        let cartList = await cartTable.findAll({
            where: { id: { [Op.between]: [startId, startId + 19] }, user: user.dataValues.id }
        });
        for (i in cartList) {
            let product = await productTable.findOne({ where: { id: cartList[i].dataValues.product } });
            returnFilterList.push(product.dataValues);
        }
        return ({ response: { status: "ok", data: returnFilterList } });
    } else {
        return ({ response: { status: "error", info: "No auth." } });
    }
}

exports.addCartPOST = async function (token, product, count = 1) {
    let user = await userTable.findOne({ where: { token } });
    if (user) {
        let productIsset = await productTable.findOne({ where: { id: product } });
        if (productIsset) {
            let cartIsset = await cartTable.findOne({ where: { user: user.dataValues.id, product } });
            if (cartIsset) {
                return ({ response: { status: "error", info: "This product already added." } });
            } else {
                cartTable.create({
                    product: product,
                    count: count,
                    user: user.dataValues.id
                });
                return ({ response: { status: "ok" } });
            }
        } else {
            return ({ response: { status: "error", info: "Cant find product." } });
        }
    } else {
        return ({ response: { status: "error", info: "No auth." } });
    }
}

exports.changeCartPUT = async function (token, product, count = 1) {
    let user = await userTable.findOne({ where: { token } });
    if (user) {
        let productIsset = await productTable.findOne({ where: { id: product } });
        if (productIsset) {
            let cart = await cartTable.findOne({ where: { user: user.dataValues.id, product } });
            if (cart) {
                cart.count = count;
                cart.save();
                return ({ response: { status: "ok" } });
            } else {
                return ({ response: { status: "error", info: "This product cart cant find." } });
            }
        } else {
            return ({ response: { status: "error", info: "Cant find product." } });
        }
    } else {
        return ({ response: { status: "error", info: "No auth." } });
    }
}

exports.productCartDELETE = async function (token, product) {
    let user = await userTable.findOne({ where: { token } });
    if (user) {
        let cartIsset = await cartTable.findOne({ where: { user: user.dataValues.id, product } });
        if (cartIsset) {
            cartIsset.destroy();
            return ({ response: { status: "ok" } });
        } else {
            return ({ response: { status: "error", info: "This product cart cant find." } });
        }
    } else {
        return ({ response: { status: "error", info: "No auth." } });
    }
}
