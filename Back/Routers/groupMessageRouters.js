const express = require('express');
const groupMessageControllers = require('./../Controllers/groupMessageControllers');
const middlewares = require('./../Controllers/middlewares');
const router = express.Router();

router.use(middlewares.checkTokenValidity);
router.use(middlewares.isUserInGroup);

router.post('/', groupMessageControllers.createGroupMessage); // happen on send message
router.get('/group-messagesv1/:group', groupMessageControllers.getGroupMessages);
router.delete('/:id', groupMessageControllers.deleteGroupMessage);

module.exports = router;