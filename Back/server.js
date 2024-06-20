const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const {Server} = require('socket.io');
const http = require('http');
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
// const DB = process.env.DATABASE;


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5174'
    }
})


io.on('connection', socket => {
    socket.on('join room', data => {
        socket.join(data.room);
    })

    socket.on('leave room', data => {
        socket.leave(data.room);
    })

    socket.on('send message', data => {
        socket.to(data.room).emit('receive message', data);
    })

    socket.on('send group message', data => {
        socket.to(data.room).emit('receive group message', data);
    })

    socket.on('typing', data => {
        socket.to(data.room).emit('receive typing', data);
    })

    socket.on('group typing', data => {
        socket.to(data.room).emit('receive group typing', data);
    })

    socket.on('delete chat', data => {
        socket.to(data.room).emit('receive delete chat', data);
    })

    socket.on('delete group', data => {
        socket.to(data.room).emit('receive delete group', data);
    })

    socket.on('create chat', data => {
        socket.to(data.room).emit('receive create chat', data);
    })

    // all participants will receive it
    socket.on('create group', data => {
        data.rooms.forEach(room => socket.to(room).emit('receive create group', data));
    })

    // the removed one only will receive it
    socket.on('remove participant', data => {
        socket.to(data.room).emit('receive remove participant', data);
    })

    // the added one only will receive it
    socket.on('add participant', data => {
        socket.to(data.room).emit('receive added to group', data);
    })

    // only the admin will receive it
    socket.on('leave group', data => {
        socket.to(data.room).emit('receive leave group', data);
    })
})


mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(con => {
    console.log("connection succesfull✅");
});


const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log('listening...');
})