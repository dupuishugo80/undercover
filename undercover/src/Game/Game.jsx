import React, { useState } from "react";

import "../Game/Game.css";

import { useParams } from 'react-router-dom';
import io from 'socket.io-client';


const socket = io('http://localhost:4000'); 

const Game = (props) => {
  const { roomId, Username } =  useParams();
  const [connected, setConnected] = useState(false);
  const [isMyTour, setIsMyTour] = useState(false);
  const [nbPlayer, setNbPlayer] = useState(0);
  const [arrayPlayer, setArrayPlayer] = useState([]);
  const [indices, setIndices] = useState([]);
  // const [arrayAllPlayer, setarrayAllPlayer] = useState([]);
  const [arrayTourUsername, setArrayTourUsername] = useState("");
  const [submitIndice, setSubmitIndice] = useState("");
  // const [roomInfo, setRoomInfo] = useState([]);
  const [nbMaxPlayer, setNbMaxPlayer] = useState(0);
  const [started, setStarted] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [seconds, setSeconds] = useState(10);
  const [countdown, setCountdown] = useState(null);


  const handleConnect = (event) => {
    socket.emit('joinRoom', roomId, Username);
  };

  socket.on("isConnected", (state, room) => {
    if(state === true){
      setConnected(true);
    }
  })

  socket.on("nbPlayerInRoom", (nb) => {
    setNbPlayer(nb);
  })

  socket.on("listPlayer", (listPlayer) => {
    setArrayPlayer(listPlayer);
  })

  socket.on("roomInfo", (roomInfo) => {
    setNbMaxPlayer(roomInfo.find((item) => item.roomId === roomId).nbMaxPlayer);
  })

  socket.on("broadcastMessage", (message) => {
    setBroadcastMessage(message);
    setStarted(true);
  });

  socket.on("arrayTourUsername", (arrayTourUsername, arrayTour) => {
    setArrayTourUsername(arrayTourUsername);
    if(arrayTourUsername === Username){
      setIsMyTour(true);
    }else{
      setIsMyTour(false);
    }
  });

  socket.on("indices", (message) => {
    setIndices(message);
  });

  socket.on("timer", (timer, countdown) => {
    setCountdown(countdown);
    setSeconds(timer);
  });

  socket.on("timeout", (roomId) => {
    socket.emit('nextPlayer', roomId, arrayTourUsername);
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    socket.emit('submitIndice', roomId, submitIndice, Username);
    setSubmitIndice('');
    setIsMyTour(false);
    socket.emit('nextPlayer', roomId, arrayTourUsername);
    socket.emit('resetTimer', countdown, roomId);
  };

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
                <li key={player.socketId}>
                  {player.username}
                  {started ? (
                    <div>
                      Indices :
                      <ul>
                        {indices
                          .filter((ind) => ind.username === player.username && ind.roomId === roomId)
                          .map((ind, index) => (
                            <li key={index}>{ind.indice}</li>
                          ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {started ? (
          <div>
            <br></br>
            Mot attribué : <b>{broadcastMessage}</b>
            <br></br>
            <br></br>
            Au tour de  <b>{arrayTourUsername}</b> de donner un indice, temps restant : <b>{seconds}</b> secondes.
            {isMyTour ? (
              <div>
                <br></br>
                <form onSubmit={handleSubmit}>
                <label>
                  <b>Indice :</b>
                  <input type="text" className="inputIndice" value={submitIndice} onChange={(e) => setSubmitIndice(e.target.value)} />
                </label>
                <button type="submit" className="buttonIndice">Envoyer</button>
              </form>
              </div>
            ) : null}
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