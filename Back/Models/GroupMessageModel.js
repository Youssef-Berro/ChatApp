const mongoose = require('mongoose');


const groupMessageSchema = new mongoose.Schema({
    content: {
        type: String,
        require: [true, 'group message must contain a value'],
        minlength: [1, 'you cannot send empty message'],
        trim: true
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        require: [true, 'group message must be from a sender'],
        ref: 'User'
    },
    group: {
        type: mongoose.Schema.ObjectId,
        require: [true, 'group message must belong to a group'],
        ref: 'Group'
    }
},{
    timestamps: true
})


const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

module.exports = GroupMessage;