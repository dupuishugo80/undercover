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
  const [seconds, setSeconds] = useState(10);
  const [submitIndice, setSubmitIndice] = useState("");
  const [arrayTourUsername, setArrayTourUsername] = useState("");
  const [indices, setIndices] = useState([]);
  const [isMyTour, setIsMyTour] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [tourActuel, setTourActuel] = useState(0);
  const [tourMax, setTourMax] = useState(0);
  const [indiceParTour, setIndiceParTour] = useState(0);
  const [tourVote, setTourVote] = useState(false);
  const [votedPlayer, setVotedPlayer] = useState("");
  const [alreadyVote, setAlreadyVote] = useState(false);
  const [loose, setLoose] = useState(false);
  const [win, setWin] = useState(false);
  const [votedPlayerFalse, setVotedPlayerFalse] = useState("");
  const [votedPlayerTrue, setVotedPlayerTrue] = useState("");
  const [undercoverUsername, setUndercoverUsername] = useState("");
  const [badVote, setBadVote] = useState("");
  const [finished, setFinished] = useState(false);


  function handleConnect() {
    socket.emit("createRoom", roomId, Owner, nbMaxPlayer);
  }

  socket.on("isConnected", (state, room) => {
    if (state === true) {
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

  socket.on("inGame", (touractuel, tourmax, indice) => {
    setTourActuel(touractuel);
    setTourMax(tourmax);
    setIndiceParTour(indice);
  });

  socket.on("broadcastMessage", async (message) => {
    setBroadcastMessage(message);
    setStarted(true);
  });

  socket.on("arrayTourUsername", (arrayTourUsername, arrayTour) => {
    setArrayTourUsername(arrayTourUsername);
    if(arrayTourUsername === Owner){
      setIsMyTour(true);
    }else{
      setIsMyTour(false);
    }
  });

  socket.on("indices", (message) => {
    setIndices(message);
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    socket.emit('submitIndice', roomId, submitIndice, Owner);
    setSubmitIndice('');
    setIsMyTour(false);
    socket.emit('nextPlayer', roomId, arrayTourUsername);
    socket.emit('resetTimer', countdown, roomId)
  };

  socket.on("timer", (timer, countdown) => {
    setCountdown(countdown);
    setSeconds(timer);
  });

  socket.on("tourVote", () => {
    setTourVote(true);
  });

  socket.on("votedPlayer", (username, finished, innocentwin, und = "") => {
    setTourVote(false);
    if(finished){
      if(innocentwin){
        setVotedPlayerTrue(username);
        setWin(true);
        setStarted(false);
        setFinished(true);
      }else{
        setVotedPlayerFalse(username);
        setUndercoverUsername(und);
        setFinished(true);
        setStarted(false);
        setLoose(true)
      }
    }else{
      setBadVote(true);
      setVotedPlayerFalse(username);
    }
  });

  function handleVote(username) {
    socket.emit("submitVote", roomId, username);
    setAlreadyVote(true);
  }

  socket.on("timeout", (roomId) => {
    socket.emit('nextPlayer', roomId, arrayTourUsername);
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
                <li key={player.socketId}>
                  {player.username} 
                  {tourVote ? (
                    <div>
                    {!alreadyVote ? (
                      <button className="buttonvote" onClick={() => handleVote(player.username)}>Voter</button>
                    ) : null}
                    </div>
                  ) : null}
                  {started ? (
                    <div>
                      Indices :
                      <ul>
                        {indices
                          .filter((ind) => ind.username === player.username && ind.roomId === roomId)
                          .map((ind, index) => (
                            <b><li key={index}>{ind.indice}</li></b>
                          ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {!started ? (
          <div>
           {!finished ? (
            <div className="div-button">
            <button className="buttonstart" onClick={handleClick}>
              Lancer la partie
            </button>
            </div>
            ) : null}
          </div>
        ) : null}
        {started ? (
          <div>
           <br></br>
            Mot attribué : <b>{broadcastMessage}</b>
            <br></br>
            <br></br>
            Tour : <b>{tourActuel}/{tourMax}</b>
            <br></br>
            Indice : <b>{indiceParTour}/3</b>
            <br></br>
            <br></br>
            {!tourVote ? (
              <div>
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
        {tourVote ? (
          <div>
          Il est maintenant l'heure de voter pour celui que tu penses être l'imposteur
          </div>
        ) : null}
        </div>
      ) : null }
      {loose ? (
        <div>
          <b>{votedPlayerFalse}</b> a été désigné comme étant l'Undercover, il était innocent. <b>{undercoverUsername}</b> remporte la partie. !
        </div>
      ) : null}
      {win ? (
        <div>
          <b>{votedPlayerTrue}</b> a été désigné comme étant l'Undercover, il était coupable. Les innocents remportent la partie. !
        </div>
      ) : null}
      {badVote ? (
        <div>
          <b>{votedPlayerFalse}</b> a été désigné comme étant l'Undercover, il était innocent. La partie continue.
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
