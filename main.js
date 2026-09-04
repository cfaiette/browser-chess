import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ChessRules } from "./chess/rules.js";
import { createBoard, squareToWorld } from "./board/index.js";
import { createPieceMesh } from "./pieces/index.js";

const app = document.getElementById("app");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x12161c);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 10, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.4, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.48;

const hemi = new THREE.HemisphereLight(0xf0f4ff, 0x2a1d14, 0.55);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xfff2dd, 1.15);
key.position.set(6, 12, 4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
scene.add(key);

createBoard(scene);
const game = new ChessRules();
const pieces = new THREE.Group();
scene.add(pieces);

const statusEl = document.createElement("div");
statusEl.style.cssText =
  "position:fixed;left:16px;bottom:16px;padding:10px 12px;background:#0f141bcc;color:#f4f1ea;font:14px/1.4 Georgia,serif;border:1px solid #334;border-radius:8px;";
document.body.appendChild(statusEl);

let selected = null;
const highlights = new THREE.Group();
scene.add(highlights);

function syncPieces() {
  pieces.clear();
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const piece = game.board[rank][file];
      if (!piece) continue;
      const square = `${String.fromCharCode(97 + file)}${rank + 1}`;
      const mesh = createPieceMesh(piece.type, piece.color);
      const pos = squareToWorld(square);
      mesh.position.set(pos.x, 0.06, pos.z);
      mesh.userData.square = square;
      pieces.add(mesh);
    }
  }
  statusEl.textContent = `${game.turn} to move · ${game.fen()}`;
}

function clearHighlights() {
  highlights.clear();
}

function showMoves(from) {
  clearHighlights();
  for (const to of game.legalMoves(from)) {
    const marker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.04, 24),
      new THREE.MeshBasicMaterial({ color: 0x7dd3a7, transparent: true, opacity: 0.7 }),
    );
    const pos = squareToWorld(to);
    marker.position.set(pos.x, 0.14, pos.z);
    marker.userData = { to, from };
    highlights.add(marker);
  }
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function pickSquare(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects([...pieces.children, ...highlights.children], false);
  if (!hits.length) return null;
  const obj = hits[0].object;
  if (obj.userData.to) return { kind: "move", ...obj.userData };
  if (obj.userData.square) return { kind: "piece", square: obj.userData.square };
  return null;
}

window.addEventListener("pointerdown", (event) => {
  const hit = pickSquare(event);
  if (!hit) {
    selected = null;
    clearHighlights();
    return;
  }
  if (hit.kind === "move") {
    game.move(hit.from, hit.to);
    selected = null;
    clearHighlights();
    syncPieces();
    return;
  }
  const piece = game.getPiece(hit.square);
  if (!piece || piece.color !== game.turn) return;
  selected = hit.square;
  showMoves(selected);
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

syncPieces();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.__chess = game;
