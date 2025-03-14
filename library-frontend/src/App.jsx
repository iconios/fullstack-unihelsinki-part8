import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Recommended from "./components/Recommended";
import { Routes, Route } from 'react-router-dom'
import Login from "./components/Login";
import NavBar from "./components/NavBar";
import { useState } from "react";

const App = () => {
  const [ token, setToken ] = useState(null)

  return (
    <div>
        <NavBar user={token} />
        <Routes>
          <Route path="/" element={<Authors />} />
          <Route path="/books" element={<Books />} />
          <Route path="/newbook" element={<NewBook />} />
          <Route path="/login" element={<Login userToken={setToken} />} />
          <Route path="/recommended" element={<Recommended />} />
        </Routes>
    </div>
  );
};

export default App;
