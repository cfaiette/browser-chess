// Restart Overlay Component

export function showRestartOverlay() {
  const overlay = document.getElementById('restart-overlay');
  overlay.style.display = 'block';
  overlay.innerHTML = '<button onclick="restartGame()">Restart Game</button>';
}

function restartGame() {
  // Logic to restart the game
}