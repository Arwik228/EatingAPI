'use strict';

var utils = require('../utils/writer.js');
var Product = require('../service/productService');

module.exports.createProductPOST = function createProductPOST(req, res, next) {
    var token = req.swagger.params['token'].value;
    var nameProduct = req.swagger.params['nameProduct'].value;
    var information = req.swagger.params['information'].value;
    var category = req.swagger.params['category'].value;
    var price = req.swagger.params['price'].value;
    var double = req.swagger.params['double'].value;
    var store = req.swagger.params['store'].value;
    var image_1 = req.swagger.params['image_1'].value;
    var image_2 = req.swagger.params['image_2'].value;
    var image_3 = req.swagger.params['image_3'].value;
    Product.createProductPOST(token, nameProduct, information, category, price, double, store, image_1, image_2, image_3)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.updateProductPOST = function updateProductPOST(req, res, next) {
    var token = req.swagger.params['token'].value;
    var nameProduct = req.swagger.params['nameProduct'].value;
    var information = req.swagger.params['information'].value;
    var category = req.swagger.params['category'].value;
    var price = req.swagger.params['price'].value;
    var double = req.swagger.params['double'].value;
    var productID = req.swagger.params['productID'].value;
    var image_1 = req.swagger.params['image_1'].value;
    var image_2 = req.swagger.params['image_2'].value;
    var image_3 = req.swagger.params['image_3'].value;
    Product.updateProductPOST(token, nameProduct, information, category, price, double, productID, image_1, image_2, image_3)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.listProductsGET = function listProductsGET(req, res, next) {
    var startId = req.swagger.params['startId'].value;
    var amount = req.swagger.params['amount'].value;
    var word = req.swagger.params['word'].value;
    Product.listProductsGET(startId, amount, word)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.ratingProductGET = function ratingProductGET(req, res, next) {
    var token = req.swagger.params['token'].value;
    var product = req.swagger.params['product'].value;
    Product.ratingProductGET(token, product)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.ratingProductPOST = function ratingProductPOST(req, res, next) {
    var body = req.swagger.params['body'].value;
    var token = req.swagger.params['token'].value;
    Product.ratingProductPOST(body, token)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.productDELETE = function productDELETE(req, res, next) {
    var token = req.swagger.params['token'].value;
    var id = req.swagger.params['id'].value;
    var double = req.swagger.params['double'].value;
    Product.productDELETE(id, token, double)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

