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
  const [started, setStarted] = useState(false);
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
    setStarted(true);
  });

  if(connected){
    return (
      <div className="container">
        <div className="game-container">
          <div className="room-info">
            <h1>Info sur la partie :</h1>
            ID d'accès : <b>{roomId}</b>
            <br></br>
            <br></br>
            Joueurs :{" "}
            <b>
              {nbPlayer}/{nbMaxPlayer}
            </b>
          </div>
          <div className="liste-joueurs">
            <h1>Liste des joueurs :</h1>
            <ul>
              {arrayPlayer.map((player) => (
                <li key={player.socketId}>{player.username}</li>
              ))}
            </ul>
          </div>
        </div>
        {started ? (
          <div>
            <br></br>
            Mot attribué : <b>{broadcastMessage}</b>
          </div>
        ) : null}
      </div>
    );
  }else{
    handleConnect();
    return(<div></div>);
  }
};

export default Game;