// Game Over Overlay Component

export function showGameOver(winner) {
  const overlay = document.getElementById('game-over-overlay');
  overlay.style.display = 'block';
  overlay.innerHTML = winner ? `${winner} wins!` : 'Stalemate!';
}
