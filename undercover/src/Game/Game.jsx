import React, { useState } from "react";

import "../Game/Game.css";
import * as gameFunctions  from '../game.js';

import { Link, useParams } from 'react-router-dom';
import io from 'socket.io-client';


const socket = io('http://localhost:4000'); 

const Game = (props) => {
  const { roomId, Username } =  useParams();
  const [connected, setConnected] = useState(false);
  const [nbPlayer, setNbPlayer] = useState(0);
  const [arrayPlayer, setArrayPlayer] = useState([]);
  const [roomInfo, setRoomInfo] = useState([]);
  const [nbMaxPlayer, setNbMaxPlayer] = useState(0);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const handleConnect = (event) => {
    socket.emit('joinRoom', roomId, Username);
  };

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
  })

  socket.on("roomInfo", (roomInfo) => {
    setRoomInfo(roomInfo);
    setNbMaxPlayer(roomInfo.find((item) => item.roomId === roomId).nbMaxPlayer);
  })

  socket.on("broadcastMessage", (message) => {
    setBroadcastMessage(message);
  });

  if(connected){
    return (
      <div className="chat-room-container">
        <h1 className="room-name">ID Partie : {roomId}</h1>
        <h1 className="room-name">Pseudo : {Username}</h1>
        <h1 className="room-name">Nombre de joueurs connecté : {nbPlayer}/{nbMaxPlayer}</h1>
        Liste des joueurs :
        <ul>
        {arrayPlayer.map(player => (
          <li key={player.socketId}>{player.username}</li>
        ))}
        </ul>
        <h3>{broadcastMessage}</h3>
      </div>
    );
  }else{
    handleConnect();
    return(<div></div>);
  }
};

export default Game;