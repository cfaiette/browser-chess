export function showGameOverOverlay(message) {
    const overlay = document.createElement('div');
    overlay.id = 'gameOverOverlay';
    overlay.innerHTML = `<h2>${message}</h2>`;
    document.body.appendChild(overlay);
}