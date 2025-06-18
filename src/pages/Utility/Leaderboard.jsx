import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../Backend/firebase/firebaseConfig';

function Leaderboard({ difficulty, onClose }) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const leaderboardRef = ref(database, `leaderboard/${difficulty.toLowerCase()}`);
    const unsubscribe = onValue(leaderboardRef, (snapshot) => {
      const data = snapshot.val() || {};
      // Aggregate wins by username
      const userWins = {};
      Object.values(data).forEach((score) => {
        const username = score.username
          ? score.username.split('@')[0].split('.')[0].toUpperCase()
          : "ANONYMOUS";
        if (!userWins[username]) {
          userWins[username] = { wins: 0, attempts: 0 };
        }
        if (score.won) {
          userWins[username].wins += 1;
        }
        userWins[username].attempts += score.attempts || 0;
      });
      // Convert to array and sort by wins descending
      const arr = Object.entries(userWins)
        .map(([username, stats]) => ({ username, ...stats }))
        .sort((a, b) => b.wins - a.wins);
      setScores(arr);
    });
    return () => unsubscribe();
  }, [difficulty]);

  return (
    <div className="leaderboard-modal">
      <div className="leaderboard-content">
        <h2>Leaderboard ({difficulty})</h2>
        <ol>
          {scores.map((score, idx) => (
            <li key={idx}>
              {score.username}: {score.wins} win{score.wins !== 1 ? "s" : ""} 
            </li>
          ))}
        </ol>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Leaderboard;