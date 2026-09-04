import { createBus } from "../lib/bus.js";
import { showPromotionUI } from "./promotionUI.js";
import { showGameOverOverlay } from "./gameOverOverlay.js";
import { showRestartOverlay } from "./restartOverlay.js";

const bus = createBus("ui");

export { showPromotionUI, showGameOverOverlay, showRestartOverlay };

export function init() {
  bus.emit("ready", {});
  return api;
}

export function showcase(container) {
  if (container) container.textContent = "ui: promotion / game-over / restart overlays";
}

export function update() {}

export function on(event, handler) {
  return bus.on(event, handler);
}

export function off(event, handler) {
  return bus.off(event, handler);
}

export function destroy() {
  ["gameOverOverlay", "promotionUI", "restartOverlay"].forEach((id) => {
    document.getElementById(id)?.remove();
  });
  bus.clear();
}

const api = {
  init,
  showcase,
  update,
  on,
  off,
  destroy,
  showPromotionUI,
  showGameOverOverlay,
  showRestartOverlay,
};
