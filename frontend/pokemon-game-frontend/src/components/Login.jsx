// src/components/Login.jsx
import React, { useState } from "react";
import { loginUser } from "../api";
import { setToken } from "../auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const token = await loginUser(username, password);
      setToken(token);
      navigate("/dashboard"); // Redirect to dashboard
    } catch (error) {
      setError("Login failed! Check your credentials.");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="title">Login</h2>
      {error && <p className="error">{error}</p>}
      <input className="input" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="button" onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
