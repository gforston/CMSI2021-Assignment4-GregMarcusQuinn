import React, { useState } from "react";
import ReactDOM from "react-dom";
import PlayerSearch from "./App"; // Import the PlayerSearch component
import "./App.css";

function Main() {
  const [playerOne, setPlayerOne] = useState(null);
  const [playerTwo, setPlayerTwo] = useState(null);

  // Helper function to calculate fantasy points
  const calculateFantasyPoints = (playerData) => {
    if (!playerData || !playerData.games_played) {
      return 0; // Avoid division by zero or missing data
    }

    const points =
      playerData.passing_yards / 25 + // 1 point per 25 passing yards
      playerData.passing_touchdowns * 4 + // 4 points per passing TD
      playerData.passing_interceptions * -2 + // -2 points per interception
      playerData.rushing_yards / 10 + // 1 point per 10 rushing yards
      playerData.rushing_touchdowns * 6 + // 6 points per rushing TD
      playerData.receiving_yards / 10 + // 1 point per 10 receiving yards
      playerData.receiving_touchdowns * 6 + // 6 points per receiving TD
      (playerData.receptions || 0) * 1 - // 1 point per reception (PPR)
      (playerData.fumbles_lost || 0) * 2; // -2 points per fumble lost

    return (points / playerData.games_played).toFixed(2); // Average points per game
  };

  // Calculate fantasy points for each player
  const playerOnePoints = playerOne ? parseFloat(calculateFantasyPoints(playerOne)) : 0;
  const playerTwoPoints = playerTwo ? parseFloat(calculateFantasyPoints(playerTwo)) : 0;

  // Determine which player has higher points
  const playerOneIsBetter = playerOnePoints > playerTwoPoints;
  const playerTwoIsBetter = playerTwoPoints > playerOnePoints;

  return (
    <div className="comparison-container">
      <h1>Player Comparison</h1>

      <div className="player-search-sections">
        <div className="player-search">
          <h2>Player 1</h2>
          <PlayerSearch onPlayerSelect={setPlayerOne} />
        </div>
        <div className="player-search">
          <h2>Player 2</h2>
          <PlayerSearch onPlayerSelect={setPlayerTwo} />
        </div>
      </div>

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
                <tr className={playerOneIsBetter ? "highlight" : ""}>
                  <td>{`${playerOne.player.first_name} ${playerOne.player.last_name}`}</td>
                  <td>{playerOnePoints}</td>
                </tr>
                <tr className={playerTwoIsBetter ? "highlight" : ""}>
                  <td>{`${playerTwo.player.first_name} ${playerTwo.player.last_name}`}</td>
                  <td>{playerTwoPoints}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p>Select both players to see their fantasy points per game.</p>
        )}
      </div>
    </div>
  );
}

// Ensure consistent export
export default Main;

// React DOM rendering
ReactDOM.render(<Main />, document.getElementById("root"));
