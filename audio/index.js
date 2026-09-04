import { createBus } from "../lib/bus.js";
import {
  playMoveSound,
  playCaptureSound,
  playCheckSound,
  playCastleSound,
  playPromoteSound,
  playMateSound,
  ensureAmbience,
} from "./moveCaptureAudio.js";

const bus = createBus("audio");

export {
  playMoveSound,
  playCaptureSound,
  playCheckSound,
  playCastleSound,
  playPromoteSound,
  playMateSound,
  ensureAmbience,
};

export function init() {
  bus.emit("ready", {});
  return api;
}

export function showcase(container) {
  if (container) {
    container.textContent = "audio: procedural wood/thud/chime + ambience + short reverb";
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
  bus.clear();
}

const api = {
  init,
  showcase,
  update,
  on,
  off,
  destroy,
  playMoveSound,
  playCaptureSound,
  playCheckSound,
  playCastleSound,
  playPromoteSound,
  playMateSound,
  ensureAmbience,
};
