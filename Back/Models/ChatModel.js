const mongoose = require('mongoose');
const ErrorHandling = require('./../Controllers/errorHandling').ErrorHandling;


const chatSchema = new mongoose.Schema({
    latestMessage: {
        type : mongoose.Schema.ObjectId,
        ref: 'Message',
        default: undefined
    },
    participants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }]
},{
    timestamps: true
});


chatSchema.pre('save', function(next) { 
    if(this.participants.length != 2)
        return next(new ErrorHandling('chat must contain exactly two participants', 400));

    next();
})



const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;