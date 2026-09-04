import { createBus } from "../lib/bus.js";
import { ChessRules } from "./rules.js";
import { SimpleAI } from "./ai.js";

const bus = createBus("chess");
let game = null;

export { ChessRules, SimpleAI };

export function init(config = {}) {
  game = config.fen ? new ChessRules(config.fen) : new ChessRules();
  bus.emit("ready", { fen: game.fen() });
  return { game };
}

export function showcase(container) {
  if (container) {
    container.textContent = "chess: rules engine (castle/EP/promo/mate) + SimpleAI";
  }
}

export function update() {}

export function on(event, handler) {
  return bus.on(event, handler);
}

export function off(event, handler) {
  return bus.off(event, handler);
}

export function destroy() {
  game = null;
  bus.clear();
}

export function getGame() {
  return game;
}

export function move(from, to, promotion = "q") {
  if (!game) return { ok: false };
  const result = game.move(from, to, promotion);
  if (result.ok) bus.emit("move-executed", { from, to, promotion, ...result });
  return result;
}
