import { useEffect, useState } from "react";
import { getPokemonList, transferPokemon } from "../api";
import { getToken } from "../auth";
import axios from "axios";

const PokemonList = ({ pokemonCollection, setPokemonCollection }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await getPokemonList(getToken());
        const pokemonWithImages = await Promise.all(
          response.data.map(async (p) => {
            try {
              const pokeResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${p.name}`);
              return {
                ...p,
                image: p.isShiny ? pokeResponse.data.sprites.front_shiny : pokeResponse.data.sprites.front_default,
                quantity: p.quantity || 1,
              };
            } catch {
              return { ...p, image: "https://via.placeholder.com/96", quantity: p.quantity || 1 };
            }
          })
        );
        setPokemonCollection(pokemonWithImages);
      } catch (error) {
        console.error("Failed to fetch Pokémon:", error);
      }
    };
    fetchPokemon();
  }, []);

  useEffect(() => {
    setPokemonCollection(pokemonCollection);
  }, [pokemonCollection]);

  const handleTransfer = async (name, isShiny) => {
    await transferPokemon(getToken(), name);
    setPokemonCollection((prevList) =>
      prevList
        .map((p) =>
          p.name === name && p.isShiny === isShiny
            ? { ...p, quantity: p.quantity - 1 }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
    updateStats();
  };

  const totalPages = Math.ceil(pokemonCollection.length / itemsPerPage);
  const displayedPokemon = pokemonCollection.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container">
      <h2 className="title">My Pokémon Collection</h2>
      <div className="pokemon-grid">
        {displayedPokemon.map((p, index) => (
          <div key={index} className={`pokemon-card ${p.isShiny ? "shiny-glow-border" : ""}`}>
            <h3 className="text-lg font-semibold">
              {p.name} {p.isShiny ? "✨" : ` (x${p.quantity})`}
            </h3>
            <img className="pokemon-img" src={p.image} alt={p.name} />
            <button className="transfer-button mt-2" onClick={() => handleTransfer(p.name, p.isShiny)}>
              Transfer for 💰
            </button>
          </div>
        ))}
      </div>

      { }
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ◀ Previous
          </button>
          <span className="pagination-text">Page {currentPage} of {totalPages}</span>
          <button
            className="pagination-button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default PokemonList;
