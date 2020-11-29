'use strict';

var utils = require('../utils/writer.js');
var Shop = require('../service/shopService');

module.exports.apiGetShopsTokenStartIdAmountGET = function apiGetShopsTokenStartIdAmountGET(req, res, next) {
  var token = req.swagger.params['token'].value;
  var startId = req.swagger.params['startId'].value;
  var amount = req.swagger.params['amount'].value;
  Shop.apiGetShopsTokenStartIdAmountGET(token, startId, amount)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.shopDELETE = function shopDELETE(req, res, next) {
  var token = req.swagger.params['token'].value;
  var id = req.swagger.params['id'].value;
  var double = req.swagger.params['double'].value;
  Shop.shopDELETE(id, token, double)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.apiCreateShopsTokenPOST = function apiCreateShopsTokenPOST(req, res, next) {
  var token = req.swagger.params['token'].value;
  var image = req.swagger.params['image'].value;
  var nameShop = req.swagger.params['nameShop'].value;
  var information = req.swagger.params['information'].value;
  var category = req.swagger.params['category'].value;
  var double = req.swagger.params['double'].value;
  var edit = req.swagger.params['edit'].value;
  Shop.apiCreateShopsTokenPOST(token, image, nameShop, information, category, double, edit)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};