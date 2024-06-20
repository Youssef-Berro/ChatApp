const express = require('express');
const cors = require('cors');
const UserRouters = require('./Routers/UserRouters');
const ChatRouters = require('./Routers/ChatRouters');
const GroupRouters = require('./Routers/GroupRouters');
const MessageRouters = require('./Routers/MessageRouters');
const groupMessageRouters = require('./Routers/groupMessageRouters');
const {ErrorHandling, errorHandlingMiddleware} = require('./Controllers/errorHandling');
const app = express();


app.use(cors());
app.use(express.json({limit : '10kb'}));
app.use(express.static(`${__dirname}/../../Front/img`));


app.use('/api/users', UserRouters);
app.use('/api/chats', ChatRouters);
app.use('/api/groups', GroupRouters);
app.use('/api/messages', MessageRouters);
app.use('/api/group-messages', groupMessageRouters);



// uncatched url's
app.all('*', (req, res, next) => {
    next(new ErrorHandling(`can't find ${req.originalUrl} in our server!`, 404))
})


app.use(errorHandlingMiddleware);
module.exports = app;