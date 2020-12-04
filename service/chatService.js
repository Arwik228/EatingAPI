const { userTable, chatTable, messageTable } = require('../database/db');
const { Op, fn } = require("sequelize");

var allConnection = [];

async function messageHandler(objectMessage, connection, CHATID) {
    if (objectMessage.message.content.length < 256) {
        if (isNaN(connection.idUserService) || isNaN(objectMessage.message.recipient) || !CHATID) {
            connection.sendUTF(
                JSON.stringify({ response: { status: "error", info: "Server error." } })
            );
        } else {
            allConnection.forEach(con => {
                if (con.idUserService == objectMessage.message.recipient) {
                    con.sendUTF(
                        JSON.stringify({
                            message: {
                                content: objectMessage.message.content,
                                sender: connection.idUserService
                            }
                        })
                    );
                }
            });
            await messageTable.create({
                content: objectMessage.message.content,
                sender: connection.idUserService,
                chatid: CHATID
            })
        }
    } else {
        connection.sendUTF(
            JSON.stringify({ response: { status: "error", info: "You message is very long." } })
        );
    }
}

async function initHandler(objectMessage, connection, USERID) {
    CHATID = USERNAME = undefined;
    let user = await userTable.findOne({ where: { token: objectMessage.init.token } });
    if (user) {
        if (isNaN(objectMessage.init.recipient)) {
            connection.sendUTF(
                JSON.stringify({ response: { status: "error", info: "Recipient is not integer." } })
            );
        } else {
            user.online = fn('NOW');
            user.save();
            if (objectMessage.init.recipient == user.dataValues.id) {
                connection.sendUTF(
                    JSON.stringify({ response: { status: "error", info: "You cannot be both the recipient and the sender." } })
                );
            } else {
                let companion = await userTable.findOne({ where: { id: objectMessage.init.recipient } });
                if (companion) {
                    let chatIsset = await chatTable.findOne({
                        where: {
                            [Op.or]: [
                                { user1: user.dataValues.id, user2: objectMessage.init.recipient },
                                { user1: objectMessage.init.recipient, user2: user.dataValues.id }
                            ]
                        }
                    });
                    if (chatIsset) {
                        CHATID = chatIsset.dataValues.id;
                    } else {
                        let record = await chatTable.create({
                            user1: user.dataValues.id,
                            user2: objectMessage.init.recipient,
                        });
                        CHATID = record.dataValues.id;
                    }
                    if (USERID) {
                        allConnection = allConnection.filter((e) => e.idUserService != USERID);
                    }
                    if (allConnection.filter((e) => e.idUserService == user.dataValues.id).length > 0) {
                        connection.sendUTF(
                            JSON.stringify({ response: { status: "error", info: "Your connection is already registered." } })
                        );
                    } else {
                        connection.idUserService = user.dataValues.id;
                        connection.firstnameUserService = user.dataValues.firstname;
                        connection.lastnameUserService = user.dataValues.lastname;
                        allConnection.push(connection);
                        USERID = user.dataValues.id;
                        USERNAME = `${user.dataValues.firstname} ${user.dataValues.lastname}`;
                        connection.sendUTF(
                            JSON.stringify({
                                response: {
                                    status: "ok",
                                    youUsername: USERNAME,
                                    youID: user.dataValues.id
                                }
                            })
                        );
                    }
                } else {
                    connection.sendUTF(
                        JSON.stringify({ response: { status: "error", info: "This recipient is not registration." } })
                    );
                }
            }
        }
    } else {
        connection.sendUTF(
            JSON.stringify({ response: { status: "error", info: "You token is bad." } })
        );
    }
    return [CHATID, USERNAME, USERID];
}

module.exports.init = function (WebSocketServer, server) {
    const wsServer = new WebSocketServer({
        httpServer: server
    });
    wsServer.on('request', async function (request) {
        var connection = request.accept(null, request.origin);
        let USERID = USERNAME = CHATID = undefined;
        connection.on('message', async function (message) {
            if (message.type === 'utf8') {
                let objectMessage = JSON.parse(message.utf8Data);
                if (objectMessage.init) {
                    [CHATID, USERNAME, USERID] = await initHandler(objectMessage, connection, USERID)
                    console.log(CHATID, USERNAME, USERID)
                } else if (objectMessage.message) {
                    messageHandler(objectMessage, connection, CHATID);
                } else {
                    connection.sendUTF(
                        JSON.stringify({ response: { status: "error", info: "Bad request." } })
                    );
                }
            }
        });
        connection.on('close', function (connection) {
            console.log(`User ${USERNAME} is disconnect...`)
            allConnection = allConnection.filter((e) => e.idUserService != USERID);
        });
    });
}

exports.userOnlineGET = async function (id) {
    let user = await userTable.findOne({ where: { id } });
    if (user) {
        return ({ response: { status: "ok", online: user.online } });
    } else {
        return ({ response: { status: "error", info: "Cant find this user." } });
    }
}
exports.setUserOnlineGET = async function (token) {
    let user = await userTable.findOne({ where: { token } });
    if (user) {
        user.online = fn('NOW');
        user.save();
        return ({ response: { status: "ok" } });
    } else {
        return ({ response: { status: "error", info: "No auth." } });
    }
}

exports.allChatsGET = async function (token, startId) {
    let user = await userTable.findOne({ where: { token } });
    if (user) {
        let finalData = []
        let chatLIST = await chatTable.findAll({
            limit: 10,
            where: {
                [Op.or]: [
                    { user1: user.dataValues.id },
                    { user2: user.dataValues.id }
                ],
                id: { [Op.gte]: startId }
            }
        });
        for (i in chatLIST) {
            let lastComment = await messageTable.findOne({
                where: {
                    chatid: chatLIST[i].dataValues.id
                },
                order: [['id', 'DESC']]
            });
            let interlocutorID = user.dataValues.id == chatLIST[i].dataValues.user1 ? chatLIST[i].dataValues.user2 : chatLIST[i].dataValues.user1;
            let inter = await userTable.findOne({
                where: {
                    id: interlocutorID
                }
            });
            finalData.push({
                chatID: chatLIST[i].dataValues.id,
                lastComment: lastComment ? lastComment.dataValues.content : "",
                interlocutor: `${inter.dataValues.firstname} ${inter.dataValues.lastname}`
            })
        }
        return ({ response: { status: "ok", list: finalData } });
    } else {
        return ({ response: { status: "error", info: "No auth." } });
    }
}

exports.messageChatGET = async function (token, startId, chatID) {
    let user = await userTable.findOne({ where: { token } });
    if (user) {
        let chatACCESS = await chatTable.findOne({ where: { id: chatID } });
        if (chatACCESS.dataValues.user1 == user.dataValues.id || chatACCESS.dataValues.user2 == user.dataValues.id) {
            let messageFilter = [];
            let message = await messageTable.findAll({
                limit: 20,
                where: {
                    chatid: chatID,
                    id: { [Op.lt]: (startId == 0 ? 2147483647 : startId) }
                },
                order: [['id', 'DESC']]
            });
            if (message.length > 0) {
                message.forEach(element => {
                    messageFilter.push(element.dataValues);
                });
                return ({ response: { status: "ok", message: messageFilter } });
            } else {
                return ({ response: { status: "error", info: "No message." } });
            }
        } else {
            return ({ response: { status: "error", info: "No access." } });
        }
    } else {
        return ({ response: { status: "error", info: "No auth." } });
    }
}

/*
 * Messages persist regardless of whether there is a second person on the socket
 * To send the user must be registered in the database
 * registration websocket
 *      {init:{token:"string",recipient: int}}
 * send message user
 *      {message:{content:"string",recipient: int}}
*/
