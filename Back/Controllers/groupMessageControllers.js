const Group = require('../Models/GroupModel');
const GroupMessage = require('./../Models/GroupMessageModel');
const {ErrorHandling, handleCastErrorDB, handleDuplicateFieldsDB} = require('./errorHandling');
const {excludeFields} = require('./middlewares');


const createGroupMessage = async (req, res, next) => {
    try {
        const {content, group} = req.body;
        if(!content || !group)   throw new ErrorHandling('missing msg content or group id', 400);


        let message = await GroupMessage.create({
            content: content,
            sender: req.user.id,
            group: group
        })

        await Group.findByIdAndUpdate(group, {latestMessage: message._id});

        message = await GroupMessage.findById(message._id).populate('sender', 'name photo');
        res.status(201).json(message);
    }catch (err) {
        // error code = 11000 if the error throwed by a unique validator
        if(err.code == 11000) {
            const key = `${Object.keys(err.keyValue)}`;
            return next(new handleDuplicateFieldsDB(400, key, err.keyValue[key]));
        }
        else if(err.statusCode)    return next(err); // error already wrapped

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}


const getGroupMessages = async (req, res, next) => {
    try {
        const messages = await GroupMessage.find({group: req.group}).populate('sender', 'name photo')
        excludeFields(messages, 'group', 'updatedAt', '--v');

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


const deleteGroupMessage = async (req, res, next) => {
    try {
        const message = await GroupMessage.findByIdAndDelete(req.params.id);
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
    createGroupMessage,
    getGroupMessages,
    deleteGroupMessage
};