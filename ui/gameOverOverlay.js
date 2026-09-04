export function showGameOverOverlay(message) {
  document.getElementById("gameOverOverlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "gameOverOverlay";
  overlay.style.cssText =
    "position:fixed;top:24px;left:50%;transform:translateX(-50%);padding:14px 18px;background:#0f141bdd;color:#f4f1ea;border:1px solid #445;border-radius:10px;z-index:15;font:18px Georgia,serif;";
  overlay.innerHTML = `<strong>${message}</strong>`;
  document.body.appendChild(overlay);
}
