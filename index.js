const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);
app.use(express.static('public', {index: 'Login.html'}));
const users = [];

server.listen(3000, () => {
    console.log('listening on *:3000');
});

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);

    socket.on('disconnect', () => {
        const user = UserLeave(socket.id);
        if(user){
            io.to(user.room).emit('users_in_room',getRoomUsers(user.room));
            io.to(user.room).emit('userleave',`${user.username} leave the room`);
        }
    });
    socket.on('join-room', (room, user) => {
       
        const users = addUser(socket.id, user, room);

        socket.join(room);
        io.to(room).emit('room-brocast', `${user} has join ${room}`);
        io.to(room).emit('users_in_room', getRoomUsers(room));

        socket.on('send-message', (msg) => {
            io.to(room).emit('send-message', msg);
        });

    });
});


function addUser(id, username, room) {
    const user = {
        id,
        username,
        room
    };
    users.push(user);
    return user;
}

// function findCurrentUser(id) {
//     return users.find(user => user.id === id);
// }

function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

function UserLeave(id) {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}
