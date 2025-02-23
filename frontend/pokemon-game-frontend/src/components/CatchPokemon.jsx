import { useState, useRef, useEffect } from "react";
import { getToken } from "../auth";
import axios from "axios";
import pokeballImage from "../assets/pokeball.png";
import ShinySparkleEffect from "./ShinySparkleEffect";


const CatchPokemon = ({ updatePokemonList, updateStats }) => {
  const [pokemon, setPokemon] = useState(null);
  const [message, setMessage] = useState("");
  const [pokeballs, setPokeballs] = useState(5);
  const [battleMode, setBattleMode] = useState(false);
  const [animationState, setAnimationState] = useState("idle");
  const [throwCoordinates, setThrowCoordinates] = useState({ x: 0, y: 0 });
  const pokeballRef = useRef(null);
  const pokemonRef = useRef(null);
  const battleContainerRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [showShinyEffect, setShowShinyEffect] = useState(false);

  useEffect(() => {
    if (battleMode && pokemonRef.current && battleContainerRef.current) {
      updateThrowCoordinates();
    }
  }, [battleMode, pokemon]);

  const updateThrowCoordinates = () => {
    if (!pokemonRef.current || !battleContainerRef.current || !pokeballRef.current) return;

    const pokemonRect = pokemonRef.current.getBoundingClientRect();
    const containerRect = battleContainerRef.current.getBoundingClientRect();
    const pokeballRect = pokeballRef.current.getBoundingClientRect();

    const targetX = pokemonRect.left - containerRect.left + (pokemonRect.width / 2);
    const targetY = pokemonRect.top - containerRect.top + (pokemonRect.height / 2);
    const startX = pokeballRect.left - containerRect.left + (pokeballRect.width / 2);
    const startY = pokeballRect.top - containerRect.top + (pokeballRect.height / 2);

    const deltaX = targetX - startX;
    const deltaY = targetY - startY;

    setThrowCoordinates({
      x: deltaX,
      y: deltaY,
      startX: startX,
      startY: startY,
    });
  };

  const handleEncounter = async () => {
    if (battleMode) return;

    setMessage("🔎 Searching...");
    setPokemon(null);
    setAnimationState("idle");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/encounter", {}, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      if (response.status === 200 && response.data.pokemon) {
        setPokemon(response.data.pokemon);
        setMessage(`🔥 A wild ${response.data.pokemon.name} appeared!`);
        setSessionId(response.data.session_id);
        if (response.data.pokemon.isShiny) {
          setShowShinyEffect(true);
        }
        setTimeout(() => {
          setBattleMode(true);
          updateThrowCoordinates();
        }, 500);
      } else {
        setMessage("❌ No Pokémon found. Try again.");
      }
    } catch (error) {
      setMessage("❌ Error: Could not find a Pokémon.");
    }
  };

  const handleThrowPokeball = async (e) => {
    e.stopPropagation();
    if (!pokemon || animationState !== "idle" || pokeballs <= 0) {
      if (pokeballs <= 0) setMessage("❌ No Pokéballs left!");
      return;
    }

    updateThrowCoordinates();
    setPokeballs(prev => prev - 1);
    setAnimationState("throwing");
    setMessage(`🎾 Throwing a Pokéball at ${pokemon.name}...`);

    setTimeout(() => {
      setAnimationState("hit");

      setTimeout(() => {
        setAnimationState("shaking");

        setTimeout(async () => {
          try {
            const response = await axios.post("http://127.0.0.1:8000/api/throw-ball", {}, {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${getToken()}`,
                "X-Session-ID": sessionId
              }
            });

            setMessage(response.data.message);

            if (!response.data.pokemonEscaped) {
              updatePokemonList(prevCollection => {
                const existingPokemonIndex = prevCollection.findIndex(
                  p => p.name === pokemon.name && p.isShiny === pokemon.isShiny
                );

                if (existingPokemonIndex !== -1) {
                  return prevCollection.map((p, index) =>
                    index === existingPokemonIndex ? { ...p, quantity: p.quantity + 1 } : p
                  );
                } else {
                  return [...prevCollection, { ...pokemon, quantity: 1 }];
                }
              });
            }


            setPokeballs(response.data.pokeballsLeft);

            setTimeout(() => {
              setBattleMode(false);
              setAnimationState("idle");
            }, 1000);
          } catch (error) {
            setMessage("❌ Failed to throw the Pokéball.");
            setAnimationState("idle");
          }
        }, 2000);
      }, 300);
    }, 500);
  };

  return (
    <div className="catch-area" onClick={handleEncounter}>
      {!battleMode && <div className="grass-overlay" />}
      {message && <p className={`encounter-text ${pokemon?.isShiny ? 'shiny-text-effect' : ''}`}>
        {message}
      </p>}

      {battleMode && pokemon && (
        <div className="battle-container" ref={battleContainerRef}>
          {showShinyEffect && <ShinySparkleEffect pokemonRef={pokemonRef} />}
          <img
            ref={pokemonRef}
            className={`enemy-pokemon ${animationState === "hit" || animationState === "shaking" ? "pokemon-hide" : ""}`}
            src={pokemon.image}
            alt={pokemon.name}
          />

          <div
            ref={pokeballRef}
            className={`pokeball-container ${animationState}`}
            style={{
              "--throw-distance-x": `${throwCoordinates.x}px`,
              "--throw-distance-y": `${throwCoordinates.y}px`,
            }}
          >
            <img
              className="pokeball"
              src={pokeballImage}
              alt="Pokéball"
              onClick={handleThrowPokeball}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CatchPokemon;