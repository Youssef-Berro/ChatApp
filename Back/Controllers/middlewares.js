const jwt = require('jsonwebtoken');
const {ErrorHandling} = require('./errorHandling');
const Chat = require('./../Models/ChatModel');
const User = require('./../Models/UserModel');
const Message = require('./../Models/MessageModel');
const GroupMessage = require('./../Models/GroupMessageModel');
const Group = require('./../Models/GroupModel');


// 401 : unauthorized , 403 : malformed token
const checkTokenValidity = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if(!token)  throw new ErrorHandling('you are not log in', 401);


        if(!token.startsWith('Bearer'))   throw new ErrorHandling('token must start with Bearer string', 403); 
        token = token.split(' ')[1];

        const decode = jwt.verify(token, process.env.SECRET_JWT);

        // jwt.verify verify 100% if the user exist or not but we do the next part because when
        // a user have been deleted, jwt.verify don't know, so we must recheck 
        const decodedUser = await User.findById(decode.id);
        if(!decodedUser)   throw new ErrorHandling('the user belonging to this token does no longer exist', 401)
        
        if(decodedUser.isChangedPassword(decode.iat))
            throw new ErrorHandling('user recently changed password, log in again', 401)

        req.user = decodedUser;
        next();
    } catch(err) {
        // error already wrapped
        if(err.statusCode)  return next(err);

        // wrap the error by ErrorHandling class
        return next(new ErrorHandling(err.message, 400));
    }
}


const generateToken = (payload) => {
    return jwt.sign(payload, process.env.SECRET_JWT, {expiresIn: `${process.env.JWT_EXPIRY}`});
}


// exclude fields for response json
function excludeFields(obj, ...fields) {
    fields.forEach(el => obj[el] = undefined);
}


const isUserInChat = async (req, res, next) => {
    try {
        let chat = req.body.chat;

        // if this middleware is called by the chat-messages router means the chat
        // passed in params else in body
        if((!chat) && !(req.originalUrl.includes('chat-messages')))    
                throw new ErrorHandling('missing chat id', 400);
        
        if(!chat) {
            chat = req.originalUrl.split('/');
            chat = chat[chat.length - 1];
            req.chat = chat;
        }

        const valid = await Chat.find({_id: chat, participants: { $in: [req.user.id] }});
        if(!valid)  throw new ErrorHandling('logged in user are not in the passed chat', 400);

        next();
    }catch(err) {
        // error already wrapped
        if(err.statusCode)  return next(err);

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}

const isUserInGroup = async (req, res, next) => {
    try {
        let group = req.body.group;

        if((!group)  && !(req.originalUrl.includes('group-messagesv1')))
            throw new ErrorHandling('missing group id', 400);

        if(!group) {
            group = req.originalUrl.split('/');
            group = group[group.length - 1];
            req.group = group;
        }

        const valid = await Group.find({_id: group, participants: { $in: [req.user.id] }});
        if(!valid)  throw new ErrorHandling('logged in user are not in the passed group', 400);

        next();
    }catch(err) {
        // error already wrapped
        if(err.statusCode === 400)  return next(err);

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}

const deleteGroupMiddleware = async (groupId) => {
    try {
        await Group.findByIdAndDelete(groupId);

        next();
    }catch(err) {
        next(new ErrorHandling(err.message, 400));
    }
}


// delete related messages for logged in user
const deleteRelatedMessages = async (req, res, next) => {
    try {
        await Message.deleteMany({sender : req.user.id});

        next();
    }catch(err) {
        next(new ErrorHandling(err.message, 400));
    }
}

// delete related group messages for logged in user
const deleteRelatedGroupMessages1 = async (req, res, next) => {
    try {
        await GroupMessage.deleteMany({sender : req.user.id});

        next();
    }catch(err) {
        next(new ErrorHandling(err.message, 400));
    }
}


const deleteRelatedGroupMessages2 = async (req, res, next) => {
    try {
        await GroupMessage.deleteMany({group : req.params.groupId});

        next();
    }catch(err) {
        next(new ErrorHandling(err.message, 400));
    }
}

// delete related chats for logged in user
const deleteRelatedChats = async (req, res, next) => {
    try {
        await Chat.deleteMany({participants: { $in: [req.user.id] }});

        next();
    }catch(err) {
        next(new ErrorHandling(err.message, 400));
    }
}


// remove user from all groups
const removeFromGroups = async (req, res, next) => {
    try {
        const groups = await Group.find({participants: { $in: [req.user.id] }});

        for(let i = 0; i < groups.length; i++) {
            groups[i].participants = groups[i].participants.filter(user => user != req.user.id);
            if(groups[i].participants.length < 3)   await deleteGroupMiddleware(groups[i].id);
            else   await groups[i].save();
        }

        next();
    }catch(err) {
        next(new ErrorHandling(err.message, 400));
    }
}

const checkValidChatId = async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        if(!chat)   throw new ErrorHandling(`chat with id ${req.params.chatId} not found`, 404);

        next();
    }catch(err) {
        // error already wrapped
        if(err.statusCode)  return next(err); 

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}

// delete related group messages by chat id
const deleteRelatedMessagesForChat = async (req, res, next) => {
    try {
        await Message.deleteMany({chat : req.params.chatId});

        next();
    }catch(err) {
        next(new ErrorHandling(err.message, 400));
    }
}


module.exports = {
    generateToken,
    excludeFields,
    checkTokenValidity,
    isUserInChat,
    isUserInGroup,
    removeFromGroups,
    deleteRelatedMessages,
    deleteRelatedGroupMessages1,
    deleteRelatedGroupMessages2,
    deleteRelatedChats,
    deleteRelatedMessagesForChat,
    checkValidChatId
}