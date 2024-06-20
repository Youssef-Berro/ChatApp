const Message = require('./../Models/MessageModel');
const Chat = require('./../Models/ChatModel');
const { ErrorHandling, handleDuplicateFieldsDB, handleCastErrorDB } = require('./errorHandling');

// for chat model and groupChat waiting for socket io to see if we add latestMessage attrb or not
const createMessage = async (req, res, next) => {
    try {
        const {content, chat} = req.body;
        if(!content || !chat)   throw new ErrorHandling('missing msg content or chat id', 400);


        let message = await Message.create({
            content: content,
            sender: req.user.id,
            chat: chat
        })

        await Chat.findByIdAndUpdate(chat, {latestMessage: message._id});

        message = await Message.findById(message._id).populate('sender', 'name photo');


        res.status(201).json(message);
    }catch (err) {
        // error code = 11000 if the error throwed by a unique validator
        if(err.code == 11000) {
            const key = `${Object.keys(err.keyValue)}`;
            return next(new handleDuplicateFieldsDB(400, key, err.keyValue[key]));
        }
        else if(err.statusCode)    return next(err); // error already wrapped


        // wrap the error by ErrorHandling class
        return next(new ErrorHandling(err.message, 400));
    }
}


const getMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.id);
        if(!message) throw new ErrorHandling(`message with id: ${req.params.id} not found`, 404);


        res.status(200).json({
            status: 'success',
            message
        })
    } catch (err) {
        if(err.name === 'CastError')    return next(new handleCastErrorDB(400, err.path, err.value));
        if(err.statusCode == 404)   return next(err);

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.msg, 400));
    }
}

const getChatMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({chat: req.chat}).populate('sender', 'name photo');

        res.status(200).json({
            status: 'success',
            nbOfResults: messages.length,
            data: {messages}
        })
    } catch (err) {
        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}

const deleteMessage = async (req, res, next) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if(!message)   throw new ErrorHandling(`no message found with ID: ${req.params.id}`, 404);

        res.status(204).json({
            status : 'success',
            data: null
        })
    }catch(err) {
        // error already wrapped
        if(err.statusCode)   return next(err);

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}


module.exports = {
    createMessage,
    getMessage,
    getChatMessages,
    deleteMessage
};