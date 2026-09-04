import * as THREE from "three";
import { createBus } from "../lib/bus.js";

const bus = createBus("interaction");
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let camera = null;
let targets = () => [];

export function init(config = {}) {
  camera = config.camera ?? null;
  targets = config.targets ?? (() => []);
  bus.emit("ready", {});
  return api;
}

export function showcase(container) {
  if (container) container.textContent = "interaction: raycast pick + legal-move markers";
}

export function update() {}

export function on(event, handler) {
  return bus.on(event, handler);
}

export function off(event, handler) {
  return bus.off(event, handler);
}

export function destroy() {
  camera = null;
  targets = () => [];
  bus.clear();
}

export function pickFromEvent(event, cam = camera, objects = targets()) {
  if (!cam) return null;
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, cam);
  const hits = raycaster.intersectObjects(objects, true);
  if (!hits.length) return null;
  let obj = hits[0].object;
  while (obj && !obj.userData?.square && !obj.userData?.to && obj.parent) obj = obj.parent;
  if (obj?.userData?.to) {
    const hit = { kind: "move", ...obj.userData };
    bus.emit("pick", hit);
    return hit;
  }
  if (obj?.userData?.square) {
    const hit = { kind: "piece", square: obj.userData.square };
    bus.emit("pick", hit);
    return hit;
  }
  return null;
}

const api = { init, showcase, update, on, off, destroy, pickFromEvent };
