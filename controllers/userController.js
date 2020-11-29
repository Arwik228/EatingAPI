'use strict';

var utils = require('../utils/writer.js');
var User = require('../service/userService');

module.exports.apiCreateAccountPOST = function apiCreateAccountPOST(req, res, next) {
    var body = req.swagger.params['body'].value;
    User.apiCreateAccountPOST(body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.apiEmailAuthPUT = function apiEmailAuthPUT(req, res, next) {
    var body = req.swagger.params['body'].value;
    User.apiEmailAuthPUT(body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.apiEmailStatusGET = function apiEmailStatusGET(req, res, next) {
    var email = req.swagger.params['email'].value;
    User.apiEmailStatusGET(email)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.apiGetUserDataTokenGET = function apiGetUserDataTokenGET(req, res, next) {
    var token = req.swagger.params['token'].value;
    User.apiGetUserDataTokenGET(token)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.apiUpdateDataTokenPUT = function apiUpdateDataTokenPUT(req, res, next) {
    var token = req.swagger.params['token'].value;
    var body = req.swagger.params['body'].value;
    User.apiUpdateDataTokenPUT(token, body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.emailActiveGet = function emailActiveGet(req, res, next) {
    var smail = req.swagger.params['smail'].value;
    User.emailActiveGet(smail)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};
