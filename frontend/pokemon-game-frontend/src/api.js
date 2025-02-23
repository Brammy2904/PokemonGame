// src/api.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export const registerUser = async (username, password) => {
  return axios.post(`${API_URL}/register`, { username, password });
};

export const loginUser = async (username, password) => {
  const response = await axios.post(`${API_URL}/login`, { username, password });
  return response.data.token;
};

export const catchPokemon = async (token) => {
  return axios.post(`${API_URL}/catch`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPokemonList = async (token) => {
  return axios.get(`${API_URL}/pokemon`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const transferPokemon = async (token, name) => {
  return axios.post(`${API_URL}/transfer`, { name }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const buyPokeballs = async (token, amount) => {
  return axios.post(`${API_URL}/buy-pokeballs`, { amount }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUserStats = async (token) => {
  const response = await axios.get(`${API_URL}/user-stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
