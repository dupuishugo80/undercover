function websocket() {
    const app = require('express')();
    const server = require('http').Server(app);
    const io = require("socket.io")(server, {
        cors: {
        origin: "*",
        },
    });

    const gameFunctions = require('./utils');

    const chatRooms = new Map();

    const arrayRoom = [];

    const arrayRoomInfo = [];

    io.on('connection', (socket) => {

    socket.on('joinRoom', (roomId,username)  => {
        const count = arrayRoom.filter(obj => obj.roomId === roomId).length;
        const user = arrayRoomInfo.find(obj => obj.roomId === roomId);
        if(count<user.nbMaxPlayer){
            chatRooms.get(roomId).add(socket.id);
            socket.join(roomId);
            io.to(socket.id).emit("isConnected", true, roomId);
            io.to(roomId).emit("nbPlayerInRoom", io.sockets.adapter.rooms.get(roomId)?.size);
            const entryToCheck = {roomId: roomId, socketId: socket.id, username: username};
            const index = arrayRoom.findIndex((obj) => {
            return obj.socketId === entryToCheck.socketId;
            });
            if (index === -1) {
                arrayRoom.push(entryToCheck);
            }
            io.to(roomId).emit("listPlayer", (arrayRoom));
            io.to(roomId).emit("roomInfo", (arrayRoomInfo));
        }
    });

    socket.on('createRoom', (roomId,username,nbMaxPlayer)  => {
        if (!chatRooms.has(roomId)) {
            chatRooms.set(roomId, new Set());
            chatRooms.get(roomId).add(socket.id);
            socket.join(roomId);
            io.to(socket.id).emit("isConnected", true, roomId);
            io.to(roomId).emit("nbPlayerInRoom", io.sockets.adapter.rooms.get(roomId)?.size);
            const entryToCheck = {roomId: roomId, socketId: socket.id, username: username};
            const index = arrayRoom.findIndex((obj) => {
                return obj.socketId === entryToCheck.socketId;
            });
            if (index === -1) {
                arrayRoom.push(entryToCheck);
            }
            const entryToCheckInfo = {roomId: roomId, nbMaxPlayer: nbMaxPlayer};
            const indexInfo = arrayRoomInfo.findIndex((obj) => {
                return obj.roomId === entryToCheckInfo.roomId;
            });
            if (indexInfo === -1) {
                arrayRoomInfo.push(entryToCheckInfo);
            }
            io.to(roomId).emit("listPlayer", (arrayRoom));
        }
    });

    socket.on('startGame', async (roomId)  => {
        const wordlist = await gameFunctions.getRandomWord();
        const socketsInRoom = arrayRoom.filter((socketRoom) => socketRoom.roomId === roomId);
        const randomIndex = Math.floor(Math.random() * socketsInRoom.length);
        const randomSocketId = socketsInRoom[randomIndex].socketId;
        const otherSocketsInRoom = socketsInRoom.filter((socketRoom) => socketRoom.socketId !== randomSocketId);
        io.to(randomSocketId).emit("broadcastMessage", wordlist[0]);
        otherSocketsInRoom.forEach((element) => {
            io.to(element.socketId).emit("broadcastMessage", wordlist[1]);
          });
    });

    socket.on('disconnect', () => {
        chatRooms.forEach((sockets, roomId) => {
        if (sockets.delete(socket.id)) {
            io.to(roomId).emit("nbPlayerInRoom", io.sockets.adapter.rooms.get(roomId)?.size);
            const index = arrayRoom.findIndex((o) => o.socketId === socket.id);
            if (index !== -1) {
            arrayRoom.splice(index, 1);
            }
            io.to(roomId).emit("listPlayer", (arrayRoom));
        }
        });
    });

    });

    server.listen(4000, () => {
    console.log('Server listening on port 4000');
    });
}

module.exports = websocket;
