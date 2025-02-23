// src/components/Register.jsx
import React, { useState } from "react";
import { registerUser } from "../api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError(null);
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await registerUser(username, password);
      navigate("/login"); // Redirect to login page after registration
    } catch (error) {
      setError("Registration failed! Username may be taken.");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="title">Create an Account</h2>
      {error && <p className="error">{error}</p>}
      <input className="input" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="button" onClick={handleRegister}>Sign Up</button>
    </div>
  );
};

export default Register;
