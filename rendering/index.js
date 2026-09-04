import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createBus } from "../lib/bus.js";

const bus = createBus("rendering");
let renderer = null;
let scene = null;
let pmrem = null;

export function init(config = {}) {
  const mount = config.mount ?? document.body;
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(config.width ?? window.innerWidth, config.height ?? window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (config.append !== false) mount.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(config.background ?? 0x0b0e13);
  scene.fog = new THREE.Fog(config.fog ?? 0x0b0e13, 16, 34);

  pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  bus.emit("ready", {});
  return { renderer, scene };
}

export function showcase(container) {
  if (container) container.textContent = "rendering: WebGL + ACES + RoomEnvironment + shadows";
}

export function update(_dt, _gameState) {}

export function on(event, handler) {
  return bus.on(event, handler);
}

export function off(event, handler) {
  return bus.off(event, handler);
}

export function destroy() {
  pmrem?.dispose();
  renderer?.dispose();
  renderer?.domElement?.remove();
  renderer = null;
  scene = null;
  pmrem = null;
  bus.clear();
}

export function getRenderer() {
  return renderer;
}

export function getScene() {
  return scene;
}

export function render(camera) {
  if (renderer && scene && camera) renderer.render(scene, camera);
}
