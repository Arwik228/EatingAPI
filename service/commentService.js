
const { users, comment, product } = require('../database/db');
const { Op } = require("sequelize");

exports.commentProductDELETE = async function (token, id) {
    let response = await users.findOne({ where: { token } });
    if (response) {
        if (isNaN(id)) {
            return ({ response: { status: "error", info: "Please send correct id." } });
        }
        let request = await comment.findOne({ where: { id: parseInt(id) } });
        if (request) {
            request.destroy();
            return ({ response: { status: "ok", info: "Comment is delete." } });
        } else {
            return ({ response: { status: "error", info: "This comment cant find." } });
        }
    }
    return ({ response: { status: "error", info: "No auth." } });
}

exports.commentProductGET = async function (token, startId, amount, product) {
    let response = await users.findOne({ where: { token } });
    if (response) {
        if (isNaN(product)) {
            return ({ response: { status: "error", info: "Please send correct product." } });
        }
        data = await comment.findAll({
            where: {
                id: {
                    [Op.between]: [parseInt(startId), parseInt(startId) + parseInt(amount) - 1]
                },
                product: parseInt(product)
            }
        });
        if (data) {
            return ({ response: { status: "ok", data } })
        }
    }
    return ({ response: { status: "error", info: "No auth." } });
}

exports.createCommentPOST = async function (body, token) {
    let response = await users.findOne({ where: { token } });
    if (response) {
        if (body.content && body.content > 256) {
            return ({ response: { status: "error", info: "Please send correct content." } });
        }
        if (await product.count({ where: { id: body.product } }) == 0) {
            return ({ response: { status: "error", info: "This product cant find." } });
        }
        let request = await comment.create({
            product: body.product,
            content: body.content,
            author: response.id
        });
        if (request) {
            return ({ response: { status: "ok", info: "Comment is create." } });
        }
    }
    return ({ response: { status: "error", info: "No auth." } });
}

