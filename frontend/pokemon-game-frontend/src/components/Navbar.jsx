// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToken, removeToken } from "../auth";
import { getUserStats, buyPokeballs } from "../api";

const Navbar = ({ stats, setStats }) => {
  const token = getToken();

  useEffect(() => {
    if (token) {
      getUserStats(token).then(setStats);
    }
  }, [token]);

  const handleBuyPokeballs = async () => {
    await buyPokeballs(token, 5);
    getUserStats(token).then(setStats);
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <h1 className="text-lg font-bold">Pokémon Game</h1>
      {token && (
        <div className="nav-info">
          <p>Pokéballs: 🎾 {stats.pokeballs}</p>
          <p>PokéCoins: 💰 {stats.pokecoins}</p>
          <button className="buy-button" onClick={handleBuyPokeballs}>
            Buy 5 Pokéballs (💰10)
          </button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      )}
      {!token && (
        <div>
          <Link className="nav-button mr-4" to="/login">Login</Link>
          <Link className="nav-button" to="/register">Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
