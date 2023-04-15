import React from "react";
import { Link } from "react-router-dom";

import "./Home.css";

const Home = () => {
  const [roomName, setRoomName] = React.useState("");
  const [Username, setUsername] = React.useState("");
  const [Owner, setOwner] = React.useState("");
  const [numberPlayer, setnumberPlayer] = React.useState("");

  const handleRoomNameChange = (event) => {
    setRoomName(event.target.value);
  };

  const handleNumberPlayer = (event) => {
    setnumberPlayer(event.target.value);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleOwner = (event) => {
    setOwner(event.target.value);
  };

  return (
    <div className="main">
      <div className="home-container">
        <div className="findroom">
        <h2 class="labelfind">Rejoindre une partie</h2>
          <input
            type="text"
            placeholder="Pseudo"
            value={Username}
            onChange={handleUsernameChange}
            className="inputroom"
          /><br></br>
          <input
            type="text"
            placeholder="ID de la partie"
            value={roomName}
            onChange={handleRoomNameChange}
            className="inputroom"
          /><br></br>
          <Link to={`${roomName}/${Username}`} className="buttonfindroom">
            Rejoindre
          </Link>
        </div>
    </div>
    <div className="home-container">
        <div className="findroom">
        <h2 class="labelcreate">Créer une partie</h2>
          <input
            type="text"
            placeholder="Pseudo"
            value={Owner}
            onChange={handleOwner}
            className="inputroom"
          /><br></br>
          <input
            type="number"
            placeholder="Nombre de joueurs"
            value={numberPlayer}
            onChange={handleNumberPlayer}
            className="inputroom"
          /><br></br>
          <Link to={`create/${numberPlayer}/${Owner}`} className="buttoncreateroom">
            Créer
          </Link>
        </div>
    </div>
  </div>
  );
};

export default Home;