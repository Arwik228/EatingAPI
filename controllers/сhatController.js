'use strict';

var utils = require('../utils/writer.js');
var Cart = require('../service/chatService');

module.exports.userOnlineGET = function userOnlineGET(req, res, next) {
    var id = req.swagger.params['id'].value;
    Cart.userOnlineGET(id)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.allChatsGET = function allChatsGET(req, res, next) {
    var token = req.swagger.params['token'].value;
    var startId = req.swagger.params['startID'].value;
    Cart.allChatsGET(token, startId)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.messageChatGET = function messageChatGET(req, res, next) {
    var token = req.swagger.params['token'].value;
    var startId = req.swagger.params['startID'].value;
    var chatID = req.swagger.params['chatID'].value;
    Cart.messageChatGET(token, startId, chatID)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.setUserOnlineGET = function setUserOnlineGET(req, res, next) {
    var token = req.swagger.params['token'].value;
    Cart.setUserOnlineGET(token)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};
