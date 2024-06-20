const express = require('express');
const MessageControllers = require('./../Controllers/MessageControllers');
const middlewares = require('./../Controllers/middlewares');
const router = express.Router();

router.use(middlewares.checkTokenValidity);
router.use(middlewares.isUserInChat);

router.post('/', MessageControllers.createMessage); // happen on send message
router.get('/chat-messages/:chat', MessageControllers.getChatMessages);
router.delete('/:id', MessageControllers.deleteMessage);

module.exports = router;