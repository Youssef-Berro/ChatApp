const express = require('express');
const ChatControllers = require('./../Controllers/ChatControllers');
const middlewares = require('./../Controllers/middlewares');
const router = express.Router();

router.use(middlewares.checkTokenValidity);

router.get('/user-chats', ChatControllers.getUserChats); // return logged in user chats
router.post('/create-chat', ChatControllers.createChat);
router.delete('/delete-chat/:chatId',
                middlewares.checkValidChatId, // we must check if the chat is valid because there is a delete op
                middlewares.deleteRelatedMessagesForChat,
                ChatControllers.deleteChat);

module.exports = router;