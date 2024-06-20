const express = require('express');
const GroupControllers = require('./../Controllers/GroupControllers');
const middlewares = require('./../Controllers/middlewares');
const router = express.Router();
const multer = require('multer');

router.use(middlewares.checkTokenValidity);

router.route('/')
        .get(GroupControllers.getUserGroups) // return logged in user groups
        .post(GroupControllers.createGroup)

router.patch('/drop-photo/:id', GroupControllers.dropGroupPhoto);
router.patch('/add-participant/:groupId', GroupControllers.addParticipant);
router.patch('/remove-participant/:groupId', GroupControllers.removeParticipant);
router.patch('/leave-group/:groupId', GroupControllers.leaveGroup);


const storage = multer.diskStorage({
        destination: (req, file, cb) => {
                return cb(null, './../Front/img/groups');
        },
        filename: (req, file, cb) => {
                return cb(null, file.originalname);
        }
})
const upload = multer({storage});

router.patch('/update-group/:id', upload.single('profil'), GroupControllers.updateGroup);
router.delete('/:groupId', middlewares.deleteRelatedGroupMessages2, GroupControllers.deleteGroup);


module.exports = router;