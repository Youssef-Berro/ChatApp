const mongoose = require('mongoose');
const { ErrorHandling } = require('../Controllers/errorHandling');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'chatting group must have a name'],
        maxlength: [30, 'group name must be less than 30 character']
    },
    description: String,
    profil: {
        type: String,
        default: 'default.jpg'
    },
    participants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: [true, 'group must have participants']
    }],
    groupAdmin: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: [true, 'group must have an admin']
    },
    latestMessage: {
        type : mongoose.Schema.ObjectId,
        ref: 'GroupMessage'
    },
}, { timestamps: true })


groupSchema.pre('save', function(next) {
    if(this.participants.length < 3)
        return next(new ErrorHandling('group participants cannot be less than 3', 400));

    next();
})


const Group = mongoose.model('Group', groupSchema);

module.exports = Group;