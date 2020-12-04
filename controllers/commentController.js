'use strict';

var utils = require('../utils/writer.js');
var Comment = require('../service/commentService');

module.exports.commentProductDELETE = function commentProductDELETE(req, res, next) {
    var token = req.swagger.params['token'].value;
    var id = req.swagger.params['id'].value;
    Comment.commentProductDELETE(token, id)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.commentProductGET = function commentProductGET(req, res, next) {
    var startId = req.swagger.params['startId'].value;
    var amount = req.swagger.params['amount'].value;
    var product = req.swagger.params['product'].value;
    Comment.commentProductGET(startId, amount, product)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.createCommentPOST = function createCommentPOST(req, res, next) {
    var token = req.swagger.params['token'].value;
    var body = req.swagger.params['body'].value;
    Comment.createCommentPOST(body, token)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};
