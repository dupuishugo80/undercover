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
    const indices = [];
    let allPlayer = [{username: 0}];
    const arrayTimer = [];
    const inGame = [];
    const allVote = []

    io.on('connection', (socket) => {

    function starttimer(roomId){
        
        let count = 10;
        let countdown = setInterval(() => {
        if (count === 0) {
            io.to(roomId).emit("timer", count, countdown);
            io.to(roomId).emit("timeout", roomId);
            count = 10;
        } else {
            io.to(roomId).emit("timer", count, countdown);
            count--;
        }

        const element = inGame.find(element => element.roomId === roomId);
        if (element) {
          const touractuel = element.touractuel;
          const tourmax = element.tourmax;
          const indice = element.indice;
          io.to(roomId).emit("inGame", touractuel, tourmax, indice);        
        } 

        }, 1000);
        arrayTimer.push(countdown);
    }

    function resetTimer() {
        arrayTimer.forEach((countdown) => {
            clearInterval(countdown);
          });
      }

    socket.on('resetTimer', (countdown, roomId)  => {
        resetTimer();
        starttimer(roomId);
      });

    socket.on('joinRoom', (roomId,username)  => {
        const count = arrayRoom.filter(obj => obj.roomId === roomId).length;
        const user = arrayRoomInfo.find(obj => obj.roomId === roomId);
        if(typeof user !== 'undefined'){
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
                const filteredArrayRoom = arrayRoom.filter(item => item.roomId === roomId);
                const filteredArrayRoomInfo = arrayRoomInfo.filter(item => item.roomId === roomId);
                io.to(roomId).emit("listPlayer", (filteredArrayRoom));
                io.to(roomId).emit("roomInfo", (filteredArrayRoomInfo));
            }
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
            const filteredArrayRoom = arrayRoom.filter(item => item.roomId === roomId);
            io.to(roomId).emit("listPlayer", (filteredArrayRoom));
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
        io.to(roomId).emit("indices", indices);
        const arrayTour = arrayRoom.filter(entree => entree.roomId === roomId);
        const arrayTourToSend = arrayTour.map(objet => {
            return {
                roomId: objet.roomId,
                socketId: objet.socketId,
                username: objet.username,
                alive: true
            };
          });
        io.to(roomId).emit("arrayTourUsername", arrayTour[0].username, arrayTourToSend);
        allPlayer = arrayTourToSend;
        starttimer(roomId);
        const info = arrayRoomInfo.find(obj => obj.roomId === roomId);
        if(typeof info !== 'undefined'){
            const existeDeja = inGame.some(element => element.roomId === roomId);
            if (!existeDeja) {
                inGame.push({ roomId: roomId, touractuel: 1, tourmax: info.nbMaxPlayer-1, indice: 0 });
            }
        }
    });

    socket.on('nextPlayer', async (roomId, beforeplayer)  => {
        const index = allPlayer.findIndex(user => user.username === beforeplayer);
        if (index !== allPlayer.length - 1) {
            io.to(roomId).emit("arrayTourUsername", allPlayer[index + 1].username, allPlayer);
          } else {
            io.to(roomId).emit("arrayTourUsername", allPlayer[0].username, allPlayer);
          }
    });

    socket.on('submitIndice', async (roomId, submitIndice, Username)  => {
        indices.push({ roomId: roomId, indice: submitIndice, username: Username });
        io.to(roomId).emit("indices", indices);

        // Rechercher l'index de l'élément dont roomId est égal à 1
        const indexinGame = inGame.findIndex(element => element.roomId === roomId);
        if (indexinGame !== -1) {
            const nbindicebeforeadd = inGame[indexinGame].indice;
            const beforetour = inGame[indexinGame].touractuel;
            const tourmax = inGame[indexinGame].tourmax;
            const filteredArrayRoom = arrayRoom.filter(item => item.roomId === roomId);
            const count = indices.filter((index) => index.roomId === roomId)
            .reduce((acc, index) => {
            const user = filteredArrayRoom.find((u) => u.username === index.username);
              if (user) {
                acc[user.username] = acc[user.username] ? acc[user.username] + 1 : 1;
              }
              return acc;
            }, {});
          
          const nbPlayer = filteredArrayRoom.length;

          for (var i = 0; i < filteredArrayRoom.length; i++) {
                if (filteredArrayRoom[i].roomId === roomId) {
                    var valeur = count[filteredArrayRoom[i].username];
                }
            }
            if(count[filteredArrayRoom[filteredArrayRoom.length - 1].username] === count[filteredArrayRoom[0].username]){
                if(count[filteredArrayRoom[filteredArrayRoom.length - 1].username]%3 === 0){
                    inGame[indexinGame].indice = 0;
                    if(beforetour === tourmax){
                        inGame[indexinGame].touractuel = 0;
                    }else{
                        inGame[indexinGame].touractuel +=1;
                        io.to(roomId).emit("tourVote");
                    }
                }else{
                    inGame[indexinGame].indice += 1;
                }
            }
        }
        
    });

    socket.on('submitVote', async (roomId, username)  => {
        const filteredArrayRoom = arrayRoom.filter(item => item.roomId === roomId);
        allVote.push({ roomId: roomId, username: username});
        if(allVote.length === filteredArrayRoom.length ){
            const count = allVote.filter((index) => index.roomId === roomId)
            .reduce((acc, index) => {
            const user = filteredArrayRoom.find((u) => u.username === index.username);
              if (user) {
                acc[user.username] = acc[user.username] ? acc[user.username] + 1 : 1;
              }
              return acc;
            }, {});
            const result = Object.entries(count).reduce((acc, [key, value]) => {
                if (value > count[acc]) {
                  return key;
                }
                return acc;
              }, Object.keys(count)[0]);
              io.to(roomId).emit("votedPlayer", result);
        }
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
            resetTimer();
        }
        });
    });

    });

    server.listen(4000, () => {
    console.log('Server listening on port 4000');
    });
}

module.exports = websocket;
