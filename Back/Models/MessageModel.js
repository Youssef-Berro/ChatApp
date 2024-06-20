const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        require: [true, 'message must contain a value'],
        min: [1, 'you cannot send empty message'],
        trim: true
    },
    date: Date,
    sender: {
        type: mongoose.Schema.ObjectId,
        require: [true, 'message must be from a sender'],
        ref: 'User'
    },
    chat: {
        type: mongoose.Schema.ObjectId,
        require: [true, 'message must belong to a chat'],
        ref: 'Chat'
    }
},{
    timestamps: true
})


messageSchema.pre('save', function(next) {
    this.data = Date.now();
    next();
})


const Message = mongoose.model('Message', messageSchema);

module.exports = Message;