const User = require('./../Models/UserModel');
const {generateToken, excludeFields} = require('./middlewares');
const {ErrorHandling, handleDuplicateFieldsDB, handleUserNotFound} = require('./errorHandling');

const signUp = async (req, res, next) => {
    try {
        const {name, email, photo, password, passwordConfirm} = req.body;
        if(!name || !email || !password || !passwordConfirm)
            throw new ErrorHandling('missing data', 401);

        const newUser = await User.create({
            name, email, password, passwordConfirm, photo
        });

        const token = generateToken({id: newUser._id});
        excludeFields(newUser, 'password', 'passwordChangedAt', 'activeAccount', 'updatedAt', '__v');

        res.status(201).json({
            status: 'success',
            token,
            data: newUser
        })
    } catch(err) {
        // error code = 11000 if the error throwed by a unique validator
        if(err.code == 11000) {
            const key = `${Object.keys(err.keyValue)[0]}`;
            return next(new handleDuplicateFieldsDB(400, key, err.keyValue[key]));
        }
        else if(err.statusCode)   return next(err); // error already wrapped

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}


const logIn = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) throw new ErrorHandling('missing email or password');

        const user = await User.findOne({email}).select('+password');
        if(!user)   throw new handleUserNotFound(`incorrect email or password`, 401);

        const isPasswordCorrect = await user.checkCorrectPassword(password, user.password);
        if(!isPasswordCorrect)   throw new handleUserNotFound(`incorrect email or password`, 401);

        const token = generateToken({id: user._id});

        excludeFields(user, 'password', 'passwordChangedAt', 'updatedAt', '__v');
        res.status(200).json({
            status: 'success',
            token,
            data: user
        })
    } catch(err) {
        // error already wrapped
        if ((err.name === 'UserNotFound') || (err.statusCode))    return next(err);

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}

const searchUsers = async (req, res, next) => {
    try {
        const query = req.query.searchStr;
        // because when the string is empty => matches everything
        if(query == '')    res.status(200).json([])


        const users = await User.find({
            $and: [
                // match all email and name that contains query
                {$or: [{ name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }]},
                { _id: { $ne: req.user._id } } // exclude the logged-in user
            ]
        });

        users.forEach(user => excludeFields(user, 'password', 'passwordChangedAt', 'updatedAt', '__v'));
        res.status(200).json(users);
    } catch(err) {
        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}


const deleteUser = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.user.id);

        res.status(204).json({
            status : 'success',
            data: null
        })
    } catch (err) {
        // error already wrapped
        if(err.code)    return next(err);

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}


const updateUser = async (req, res, next) => {
    try {
        // exclude password update
        const {name, email} = req.body;

        let photo;
        console.log(req);
        // req.file exist if this controller used to update the photo
        if(req.file)    photo = req.file.filename;

        const user = await User.findByIdAndUpdate(req.user.id, {name, email, photo}, {
            new: true, 
            runValidators: true 
        }) 

        res.status(200).json({status: 'success', user})
    }catch (err) {
        next(new ErrorHandling(err.message, 400));
    }
}


const dropPhoto = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, {photo : 'default.jpg'}, {
            new: true, 
            runValidators: true 
        }) 

        res.status(200).json({status: 'success', user})
    }catch (err) {
        next(new ErrorHandling(err.message, 400));
    }
}


const changePassword = async (req, res, next) => {
    try {
        const {oldPassword, newPassword, passwordConfirm} = req.body;
        if((!oldPassword) || (!newPassword) || (!passwordConfirm))
            throw new ErrorHandling('missing old password or new password or password confirm', 401);


        const user = await User.findById(req.user.id).select("+password");
        if(!user)   throw new ErrorHandling('invalid user', 401);

        const isPasswordCorrect = await user.checkCorrectPassword(oldPassword, user.password);
        if(!isPasswordCorrect)   throw new handleUserNotFound(`incorrect email or password`, 401);


        // we don't use User.findByIdAndUpdate because validators are not checked in updating
        // only on save and create, also the pre save middlewares will not be executed
        user.password = newPassword;
        user.passwordConfirm = passwordConfirm;
        await user.save();

        const token = generateToken({id : user._id});
        res.status(200).json({
            status: 'success',
            token
        })
    } catch (err) {
        // error already wrapped
        if(err.statusCode)   return next(err);

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}


module.exports = {
    signUp,
    logIn,
    searchUsers,
    deleteUser,
    updateUser,
    changePassword,
    dropPhoto
};