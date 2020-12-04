
const { userTable, commentTable, productTable } = require('../database/db');
const { Op } = require("sequelize");

exports.commentProductDELETE = async function (token, id) {
    let user = await userTable.findOne({ where: { token } });
    if (user) {
        if (isNaN(id)) {
            return ({ response: { status: "error", info: "Please send correct id." } });
        }
        let comment = await commentTable.findOne({ where: { id } });
        if (comment) {
            comment.destroy();
            return ({ response: { status: "ok", info: "Comment is delete." } });
        } else {
            return ({ response: { status: "error", info: "This comment cant find." } });
        }
    }
    return ({ response: { status: "error", info: "No auth." } });
}

exports.commentProductGET = async function (startId, amount, product) {
    if (!startId || !amount || !product) {
        return ({ response: { status: "error", info: "Please send all value." } });
    }
    if (isNaN(startId) || isNaN(amount) || isNaN(product)) {
        return ({ response: { status: "error", info: "Please send correct data." } });
    }
    comments = await commentTable.findAll({
        where: {
            id: {
                [Op.between]: [startId, startId + amount - 1]
            },
            product: product
        }
    });
    let filterData = [];
    comments.forEach(elem => {
        filterData.push(elem.dataValues)
    });
    if (comments) {
        return ({ response: { status: "ok", filterData } })
    } else {
        return ({ response: { status: "error", info: "Disastrous request." } })
    }
}

exports.createCommentPOST = async function (body, token) {
    let user = await userTable.findOne({ where: { token } });
    if (user) {
        if (body.content && body.content.length > 256) {
            return ({ response: { status: "error", info: "Please send correct content." } });
        }
        if (await productTable.count({ where: { id: body.product } }) == 0) {
            return ({ response: { status: "error", info: "This product cant find." } });
        }
        let comment = await commentTable.create({
            product: body.product,
            content: body.content,
            author: user.id
        });
        if (comment) {
            return ({ response: { status: "ok", info: "Comment is create." } });
        } else {
            return ({ response: { status: "error", info: "Disastrous request." } })
        }
    }
    return ({ response: { status: "error", info: "No auth." } });
}

