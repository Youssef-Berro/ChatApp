const Chat = require('./../Models/ChatModel');
const User = require('./../Models/UserModel')
const { ErrorHandling, handleDuplicateFieldsDB} = require('./errorHandling');
const {excludeFields} = require('./middlewares');


const createChat = async (req, res, next) => {
    try {
        const {userId} = req.body;
        if(!userId)   throw new ErrorHandling('missing partner id', 400);
        if(userId == req.user.id)   throw new ErrorHandling("can't create chat with yourself");

        let chat = await Chat.create({
            latestMessage: req.body.latestMessage,
            participants: [req.user.id, userId] // the user who create the
            // chat, he must pass in the request body the second user id (partner)
        })

        // we do find because we must populate the participants array because
        // when we do creation or save we cannot populate, also using
        // findById it doesn't take a long time because id's are indexed by default
        chat = await Chat.findById(chat._id).populate('participants');
        res.status(201).json(chat);

    } catch(err) {
        // error code = 11000 if the error throwed by a unique validator
        if(err.code == 11000) {
            const key = `${Object.keys(err.keyValue)}`;
            return next(new handleDuplicateFieldsDB(400, key, err.keyValue[key]));
        }
        else if(err.statusCode)    return next(err);

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}

const deleteChat = async (req, res, next) => {
    try {
        await Chat.findByIdAndDelete(req.params.chatId);


        res.status(204).json({
            status : 'success',
            data: null
        })
    } catch (err) {
        next(new ErrorHandling(err.message, 400)); // wrap the error by ErrorHandling class
    }
}


// get logged in user chats
const getUserChats = async (req, res, next) => {
    try {
        let chats = await Chat.find({participants: {$in: [req.user.id]}})
                                    .populate('participants')
                                    .populate('latestMessage')
                                    .sort({updatedAt: -1}); // -1: desc

        // latestMessage attrb contain a ref to the sender
        chats = await User.populate(chats, {
            path: 'latestMessage.sender',
            select: 'name'
        })

        res.status(200).json(chats)
    } catch (err) {
        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}



module.exports = {
    createChat,
    deleteChat,
    getUserChats
}