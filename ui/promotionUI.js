export function showPromotionUI(callback) {
  document.getElementById("promotionUI")?.remove();
  const root = document.createElement("div");
  root.id = "promotionUI";
  root.style.cssText =
    "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0008;z-index:20;gap:8px;";
  ["Queen", "Rook", "Bishop", "Knight"].forEach((piece) => {
    const button = document.createElement("button");
    button.textContent = piece;
    button.style.cssText =
      "padding:12px 16px;font:16px Georgia,serif;cursor:pointer;border-radius:8px;border:1px solid #555;background:#1b2230;color:#f4f1ea;";
    button.onclick = () => {
      root.remove();
      callback(piece);
    };
    root.appendChild(button);
  });
  document.body.appendChild(root);
}
