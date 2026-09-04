export function showRestartOverlay(onRestart) {
    const overlay = document.createElement('div');
    overlay.id = 'restartOverlay';
    overlay.innerHTML = '<h2>Game Over</h2><button id="restartBtn">Restart Game</button>';
    document.body.appendChild(overlay);

    document.getElementById('restartBtn').onclick = () => {
        onRestart();
        document.body.removeChild(overlay);
    };
}