import React, { useState } from 'react';
import * as gameFunctions from '../game';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const socket = io('http://localhost:4000'); // L'adresse du serveur Socket.io

function ChatRoom() {
  const [roomId, setRoomId] = useState(gameFunctions.createNewGame());
  const [connected, setConnected] = useState(false);
  const {nbMaxPlayer} = useParams();
  const {Owner} = useParams();
  const [nbPlayer, setNbPlayer] = useState(0);
  const [arrayPlayer, setArrayPlayer] = useState([]);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  function handleConnect() {
    socket.emit('createRoom', roomId, Owner, nbMaxPlayer);
  }

  socket.on("isConnected", (state, room) => {
    if(state == true){
      setConnected(true);
    }
  })

  socket.on("nbPlayerInRoom", (nb) => {
    setNbPlayer(nb);
  })

  socket.on("listPlayer", (listPlayer) => {
    setArrayPlayer(listPlayer);
    const objet = listPlayer.find((o) => o.socketId === socket.id);
    setRoomId(objet.roomId);
  })

  function handleClick() {
    socket.emit('startGame', roomId);
  }

  socket.on("broadcastMessage", async (message) => {
    setBroadcastMessage(message);
  });

  if(connected){
    return (
      <div>
        {roomId}
        <br></br>
        Nombre de joueur : {nbPlayer}/{nbMaxPlayer}
        <br></br>
        Liste des joueurs :
        <ul>
        {arrayPlayer.map(player => (
          <li key={player.socketId}>{player.username}</li>
        ))}
        </ul>
        <button onClick={handleClick}>Lancer la partie</button>
        <h3>{broadcastMessage}</h3>
      </div>
    );
  }else{
    handleConnect()
    return (
      <div>
      </div>
    );
  }
}

export default ChatRoom;