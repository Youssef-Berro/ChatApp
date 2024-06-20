const express = require('express');
const UserControllers = require('./../Controllers/UserControllers');
const middlewares = require('./../Controllers/middlewares');
const router = express.Router();
const multer = require('multer');



router.post('/sign-up', UserControllers.signUp);
router.post('/log-in', UserControllers.logIn);


router.use(middlewares.checkTokenValidity);

router.patch('/change-password', UserControllers.changePassword);
router.get('/search', UserControllers.searchUsers);
router.patch('/drop-photo', UserControllers.dropPhoto)
router.delete('/', middlewares.deleteRelatedMessages,
                        middlewares.deleteRelatedChats,
                        middlewares.deleteRelatedGroupMessages1,
                        middlewares.removeFromGroups,
                        UserControllers.deleteUser);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, './../Front/img/users');
    },
    filename: (req, file, cb) => {
        return cb(null, file.originalname);
    }
})

const upload = multer({storage});

router.patch('/update-user', upload.single('photo'), UserControllers.updateUser);
module.exports = router;