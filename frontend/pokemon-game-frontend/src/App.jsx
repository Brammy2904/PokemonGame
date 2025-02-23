// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import CatchPokemon from "./components/CatchPokemon";
import PokemonList from "./components/PokemonList";

const App = () => {
  const [stats, setStats] = useState({ pokeballs: 0, pokecoins: 0 });
  const [pokemonCollection, setPokemonCollection] = useState([]);

  return (
    <BrowserRouter>
      <Navbar stats={stats} setStats={setStats} />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <>
              <div className="split-screen">
                <CatchPokemon updatePokemonList={setPokemonCollection} updateStats={setStats} />
                <div className="pokemon-list">
                  <PokemonList pokemonCollection={pokemonCollection} setPokemonCollection={setPokemonCollection} />
                </div>
              </div>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
