'use strict';

var utils = require('../utils/writer.js');
var Cart = require('../service/cartService');

module.exports.addCartPOST = function addCartPOST(req, res, next) {
    var token = req.swagger.params['token'].value;
    var product = req.swagger.params['product'].value;
    var count = req.swagger.params['count'].value;
    Cart.addCartPOST(token, product, count)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.myCartGet = function myCartGet(req, res, next) {
    var token = req.swagger.params['token'].value;
    var startId = req.swagger.params['startId'].value;
    Cart.myCartGet(token, startId)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.changeCartPUT = function changeCartPUT(req, res, next) {
    var token = req.swagger.params['token'].value;
    var product = req.swagger.params['product'].value;
    var count = req.swagger.params['count'].value;
    Cart.changeCartPUT(token, product, count)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.productCartDELETE = function productCartDELETE(req, res, next) {
    var token = req.swagger.params['token'].value;
    var product = req.swagger.params['product'].value;
    Cart.productCartDELETE(token, product)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};
