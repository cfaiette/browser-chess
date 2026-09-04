import { SimpleAI } from "../chess/ai.js";
import { createBus } from "../lib/bus.js";

const bus = createBus("ai");
let engine = null;

export function init(config = {}) {
  if (!config.chess) throw new Error("ai.init requires { chess }");
  engine = new SimpleAI(config.chess);
  bus.emit("ready", { depth: 3 });
  return { engine };
}

export function showcase(container) {
  if (container) {
    container.textContent = "ai: depth-3 minimax, PST, opening book, quiescence";
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
  engine = null;
  bus.clear();
}

export function suggestMove() {
  return engine?.makeMove?.() ?? null;
}

export { SimpleAI };
