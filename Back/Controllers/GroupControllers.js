const Group = require('./../Models/GroupModel');
const User = require('./../Models/UserModel')
const {ErrorHandling, handleDuplicateFieldsDB} = require('./errorHandling');


const createGroup = async (req, res, next) => {
    try {
        const {name, profil, description, participants} = req.body;
        // user pass participants in the req.body without himself
        participants.push(req.user.id);

        let group = await Group.create({
            name,
            profil,
            description,
            participants,
            groupAdmin: req.user.id
        });

        // we do find to populate
        group = await Group.findById(group._id).populate('participants');
        res.status(201).json({
            status: 'success',
            group
        })
    }catch(err) {
        // error code = 11000 if the error throwed by a unique validator
        if(err.code == 11000) {
            const key = `${Object.keys(err.keyValue)}`;
            return next(new handleDuplicateFieldsDB(400, key, err.keyValue[key]));
        }

        return next(new ErrorHandling(err.message, 400));
    }
}

const updateGroup = async (req, res, next) => {
    try {
        const {participants} = req.body;
        if(participants)    throw new ErrorHandling('add and remove participants in another endpoint', 400);

        const {name, description} = req.body;
        let profil;
        if(req.file)
            profil = req.file.filename;
        const group = await Group.findByIdAndUpdate(req.params.id, {name, description, profil}, {
            new: true,
            runValidators: true
        })

        if(!group)  throw new ErrorHandling(`group with id ${req.params.id} not found`, 404);

        res.status(200).json({
            status: 'success',
            group
        })
    }catch(err) {
        // error already wrapped
        if(err.statusCode)   return next(err);

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}

const dropGroupPhoto = async (req, res, next) => {
    try {
        const user = await Group.findByIdAndUpdate(req.params.id, {profil : 'default.jpg'}, {
            new: true, 
            runValidators: true 
        }) 

        res.status(200).json({status: 'success', user})
    }catch (err) {
        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}


const addParticipant = async (req, res, next) => {
    try {
        const{userId} = req.body;
        if(!userId)   throw new ErrorHandling('missing user id in request body', 400);


        let group = await Group.findById(req.params.groupId);
        if(!group)
            throw new ErrorHandling(`group with id ${req.params.groupId} not found`, 404);
        if(group.groupAdmin != req.user.id)
            throw new ErrorHandling('only admin can add and remove participants of a group', 401);
        if(group.participants.includes(userId))
            throw new ErrorHandling(`${userId} already in the group`, 400);

        group.participants.push(userId);
        group.save();
        group = await Group.findById(req.params.groupId)

        res.status(200).json({
            status: 'success',
            data: group
        });
    }catch(err) {
        // error already wrapped
        if(err.statusCode)   return next(err);

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}


// if the group admin remove a participant
const removeParticipant = async (req, res, next) => {
    try {
        const {userId} = req.body;
        if(!userId)   throw new ErrorHandling('missing user id in request body', 400);

        let group = await Group.findById(req.params.groupId);
        if(!group)
            throw new ErrorHandling(`group with id ${req.params.groupId} not found`, 404);
        if(group.groupAdmin != req.user.id)
            throw new ErrorHandling('only admin can add and remove participants of a group', 401);
        if(!group.participants.includes(userId))
            throw new ErrorHandling(`${userId} not in the group`, 400);
        if(group.participants.length === 3)
            throw new ErrorHandling('group participants cannot be less than 3', 400);


        group.participants = group.participants.filter(user => user != userId);
        group.save();
        group = await Group.findById(req.params.groupId);

        res.status(200).json({
            status: 'success',
            data: group
        });
    }catch(err) {
        // error already wrapped
        if(err.statusCode)  return next(err);

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}

// remove logged in user for group 
const leaveGroup = async (req, res, next) => {
    try {
        const userId = req.user._id;

        let group = await Group.findById(req.params.groupId);
        if(!group)  throw new ErrorHandling('group not found', 404);


        group.participants = group.participants.filter( participant => 
                participant.toString() != userId.toString());

        await group.save();

        res.status(200).json('success');
    }catch(err) {
        // error already wrapped
        if(err.statusCode)  return next(err);

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}


const getUserGroups = async (req, res, next) => {
    try {
        let groups = await Group.find({participants: {$in: [req.user.id]}})
            .populate('participants').populate('latestMessage')
            .sort({updatedAt: -1}); // -1: desc

        groups = await User.populate(groups, {
            path: 'latestMessage.sender',
            select: 'name'
        })

        res.status(200).json(groups);
    } catch (err) {
        next(new ErrorHandling(err.message, 400));
    }
}


const deleteGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if(!group)  throw new ErrorHandling('Group not found', 404);

        if(group.groupAdmin != req.user.id)
            throw new ErrorHandling('You are not the admin of this group', 403);

        await Group.findByIdAndDelete(req.params.groupId);

        res.status(204).json({
            status : 'success',
            data: null
        })
    } catch (err) {
        // error already wrapped
        if(err.statusCode)  return next(err);

        // wrap the error by ErrorHandling class
        next(new ErrorHandling(err.message, 400));
    }
}



module.exports = {
    createGroup,
    updateGroup,
    addParticipant,
    removeParticipant,
    leaveGroup,
    getUserGroups,
    deleteGroup,
    dropGroupPhoto
};