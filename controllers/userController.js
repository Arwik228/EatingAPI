'use strict';

var utils = require('../utils/writer.js');
var User = require('../service/userService');

module.exports.createAccountPOST = function createAccountPOST(req, res, next) {
    var body = req.swagger.params['body'].value;
    User.createAccountPOST(body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.emailAuthPUT = function emailAuthPUT(req, res, next) {
    var body = req.swagger.params['body'].value;
    User.emailAuthPUT(body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.resetPasswordGET = function resetPasswordGET(req, res, next) {
    var email = req.swagger.params['email'].value;
    User.resetPasswordGET(email)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.emailStatusGET = function emailStatusGET(req, res, next) {
    var email = req.swagger.params['email'].value;
    User.emailStatusGET(email)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.userDataGET = function userDataGET(req, res, next) {
    var token = req.swagger.params['token'].value;
    User.userDataGET(token)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.updateUserPUT = function updateUserPUT(req, res, next) {
    var token = req.swagger.params['token'].value;
    var body = req.swagger.params['body'].value;
    User.updateUserPUT(token, body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.emailActiveGET = function emailActiveGET(req, res, next) {
    var smail = req.swagger.params['smail'].value;
    User.emailActiveGET(smail)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};
