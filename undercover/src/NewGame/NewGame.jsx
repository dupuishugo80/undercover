import React, { useState } from "react";
import * as gameFunctions from "../game";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import "./NewGame.css";

const socket = io("http://localhost:4000"); // L'adresse du serveur Socket.io

function ChatRoom() {
  const [roomId, setRoomId] = useState(gameFunctions.createNewGame());
  const [connected, setConnected] = useState(false);
  const [started, setStarted] = useState(false);
  const { nbMaxPlayer } = useParams();
  const { Owner } = useParams();
  const [nbPlayer, setNbPlayer] = useState(0);
  const [arrayPlayer, setArrayPlayer] = useState([]);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  function handleConnect() {
    socket.emit("createRoom", roomId, Owner, nbMaxPlayer);
  }

  socket.on("isConnected", (state, room) => {
    if (state == true) {
      setConnected(true);
    }
  });

  socket.on("nbPlayerInRoom", (nb) => {
    setNbPlayer(nb);
  });

  socket.on("listPlayer", (listPlayer) => {
    setArrayPlayer(listPlayer);
    const objet = listPlayer.find((o) => o.socketId === socket.id);
    setRoomId(objet.roomId);
  });

  function handleClick() {
    socket.emit("startGame", roomId);
  }

  socket.on("broadcastMessage", async (message) => {
    setBroadcastMessage(message);
    setStarted(true);
  });

  if (connected) {
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
        {!started ? (
          <div className="div-button">
          <button className="buttonstart" onClick={handleClick}>
            Lancer la partie
          </button>
        </div>
        ) : null}
        {started ? (
          <div>
            <br></br>
            Mot attribué : <b>{broadcastMessage}</b>
          </div>
        ) : null}
      </div>
    );
  } else {
    handleConnect();
    return <div></div>;
  }
}

export default ChatRoom;
