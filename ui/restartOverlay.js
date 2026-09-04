export function showRestartOverlay(onRestart) {
  document.getElementById("restartOverlay")?.remove();
  const root = document.createElement("div");
  root.id = "restartOverlay";
  root.style.cssText = "position:fixed;top:72px;left:50%;transform:translateX(-50%);z-index:16;";
  const button = document.createElement("button");
  button.textContent = "Restart";
  button.style.cssText =
    "padding:10px 14px;font:15px Georgia,serif;cursor:pointer;border-radius:8px;border:1px solid #555;background:#243044;color:#f4f1ea;";
  button.onclick = () => {
    root.remove();
    onRestart?.();
  };
  root.appendChild(button);
  document.body.appendChild(root);
}
