import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./index.css";
import Game from "./Game/Game";
import Home from "./Home/Home";
import ChatRoom from "./NewGame/NewGame";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/:roomId/:Username" element={<Game />}></Route>
        <Route path="create/:nbMaxPlayer/:Owner" element={<ChatRoom />}></Route>
      </Routes>
    </Router>
  );
}

export default App;