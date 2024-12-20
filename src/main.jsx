import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import PlayerSearch from "./components/App";
import "./components/App.css";
import Header from "./components/Header";
import { useAuthentication } from "./services/authService";
import { savePlayerToFirebase, loadPlayers } from "./services/firebaseService"; 

function Main() {
  const [playerOne, setPlayerOne] = useState(null);
  const [playerTwo, setPlayerTwo] = useState(null);
  const [loadedPlayers, setLoadedPlayers] = useState([]); // State for loaded players
  const user = useAuthentication();

  // Save players when both are selected
  useEffect(() => {
    const userId = user?.uid || "guest"; // Default to "guest" if not logged in
    if (playerOne) savePlayerToFirebase(playerOne, "Player One", userId);
    if (playerTwo) savePlayerToFirebase(playerTwo, "Player Two", userId);
  }, [playerOne, playerTwo, user]);

  const handleLoadPlayers = async () => {
    await loadPlayers(user, setLoadedPlayers); // Call the function with required arguments
  };

  // Helper function to calculate fantasy points
  const calculateFantasyPoints = (playerData) => {
    if (!playerData || !playerData.games_played) {
      return 0; // Avoid division by zero or missing data
    }

    const points =
      playerData.passing_yards / 25 +
      playerData.passing_touchdowns * 4 +
      playerData.passing_interceptions * -2 +
      playerData.rushing_yards / 10 +
      playerData.rushing_touchdowns * 6 +
      playerData.receiving_yards / 10 +
      playerData.receiving_touchdowns * 6 +
      (playerData.receptions || 0) * 1 -
      (playerData.fumbles_lost || 0) * 2;

    return (points / playerData.games_played).toFixed(2); // Average points per game
  };

  // Calculate fantasy points for each player
  const playerOnePoints = playerOne
    ? parseFloat(calculateFantasyPoints(playerOne.playerData))
    : 0;
  const playerTwoPoints = playerTwo
    ? parseFloat(calculateFantasyPoints(playerTwo.playerData))
    : 0;

  // Determine which player has higher points
  const playerOneIsBetter = playerOnePoints > playerTwoPoints;
  const playerTwoIsBetter = playerTwoPoints > playerOnePoints;

  return (
    <div>
      {/* Header with Title and Sign-In/Out */}
      <Header user={user} /> {/* Use the Header component */}

      {/* Main Comparison Container */}
      <div className="comparison-container">
        <h1>Player Comparison</h1>

        {/* Player Search Sections */}
        <div className="player-search-sections">
          <div className="player-one">
            <h2>Player 1</h2>
            <PlayerSearch
              onPlayerSelect={setPlayerOne}
              playerName={
                loadedPlayers.find((p) => p.playerLabel === "Player One")?.playerName ||
                null
              }
            />
          </div>
          <div className="player-two">
            <h2>Player 2</h2>
            <PlayerSearch
              onPlayerSelect={setPlayerTwo}
              playerName={
                loadedPlayers.find((p) => p.playerLabel === "Player Two")?.playerName ||
                null
              }
            />
          </div>
        </div>

        {/* Comparison Results */}
        <div className="comparison-results">
          <h2>Comparison Results</h2>
          {playerOne && playerTwo ? (
            <div className="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Fantasy Points Per Game</th>
                  </tr>
                </thead>
                <tbody>
                  {playerOne && playerOne.playerData && playerOne.playerData.player ? (
                    <tr className={playerOneIsBetter ? "highlight" : ""}>
                      <td>{`${playerOne.playerData.player.first_name} ${playerOne.playerData.player.last_name}`}</td>
                      <td>{playerOnePoints}</td>
                    </tr>
                  ) : null}

                  {playerTwo && playerTwo.playerData && playerTwo.playerData.player ? (
                    <tr className={playerTwoIsBetter ? "highlight" : ""}>
                      <td>{`${playerTwo.playerData.player.first_name} ${playerTwo.playerData.player.last_name}`}</td>
                      <td>{playerTwoPoints}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Select both players to see their fantasy points per game.</p>
          )}
        </div>
      </div>

      {/* Loaded Players Section */}
      <div className="loaded-players-section">
        <h2>Loaded Players</h2>
        <button onClick={handleLoadPlayers}>Load Players from Firebase</button>
        {loadedPlayers.length > 0 ? (
          <ul>
            {loadedPlayers.map((player, index) => (
              <li key={index}>
                {player.playerLabel}: {player.playerName} ({player.position})
              </li>
            ))}
          </ul>
        ) : (
          <p>No players loaded yet.</p>
        )}
      </div>
    </div>
  );
}

export default Main;

ReactDOM.render(<Main />, document.getElementById("root"));