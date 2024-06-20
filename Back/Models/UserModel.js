const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        require: [true, 'user must contain a name'],
        minlength: [4, 'user name must be greater than 4 characters'],
        maxlength: [25, 'user name must be less than 25 characters']
    },
    email : {
        type : String,
        require: [true, 'user must have an email'],
        unique: [true, 'email address is already in use'],
        lowercase: true,
        validate: [validator.isEmail, 'invalid email format']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    password: {
        type : String,
        require: [true, 'user must have a password'],
        minlength: [8, 'password must be greater than 8 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        require: [true, 'user must have a confirm password'],
        validate : {
            // execute on create only
            validator: function(val) {
                return val === this.password;
            },
            message: 'new pass diff than pass confirm'
        },
        select: false
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetTokenExpiry: Date,
    activeAccount: {
        type: Boolean,
        default: true,
        select: false
    },
    deActivatedAt: {
        type: Date,
        default: undefined
    }
},{
    timestamps: true
})


userSchema.pre(/^find/, function(next) {
    this.find({activeAccount: true});

    next();
})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password'))    return next();
    
    this.password = await bcrypt.hash(this.password, 12); // salt = 12
    this.passwordConfirm = undefined; // when a field had a value undefined => doesn't appear in the DB
    next();
})


userSchema.pre('save', async function(next) {
    if(!this.isModified("password") && this.isNew)  return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})


userSchema.methods.isChangedPassword = function(tokenIssuedTime) {
    return this.passwordChangedAt ? (this.passwordChangedAt.getTime() > (tokenIssuedTime * 1000)) : false;
}

userSchema.methods.checkCorrectPassword = async (password, userPassword) => {
    return await bcrypt.compare(password, userPassword);
}


const User = mongoose.model('User', userSchema)


module.exports = User;