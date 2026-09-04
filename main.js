import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ChessRules } from "./chess/rules.js";
import { SimpleAI } from "./chess/ai.js";
import { createBoard, squareToWorld } from "./board/index.js";
import { createPieceMesh } from "./pieces/index.js";
import { playMoveSound } from "./audio/moveCaptureAudio.js";
import { showPromotionUI } from "./ui/promotionUI.js";
import { showGameOverOverlay } from "./ui/gameOverOverlay.js";
import { showRestartOverlay } from "./ui/restartOverlay.js";

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

scene.add(new THREE.HemisphereLight(0xf0f4ff, 0x2a1d14, 0.55));
const key = new THREE.DirectionalLight(0xfff2dd, 1.15);
key.position.set(6, 12, 4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
scene.add(key);

createBoard(scene);
let game = new ChessRules();
const ai = new SimpleAI(game);
const pieces = new THREE.Group();
scene.add(pieces);

const statusEl = document.createElement("div");
statusEl.style.cssText =
  "position:fixed;left:16px;bottom:16px;padding:10px 12px;background:#0f141bcc;color:#f4f1ea;font:14px/1.4 Georgia,serif;border:1px solid #334;border-radius:8px;z-index:5;";
document.body.appendChild(statusEl);

const vsAi = true;
let selected = null;
let busy = false;
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

function needsPromotion(from, to) {
  const piece = game.getPiece(from);
  if (!piece || piece.type !== "p") return false;
  const rank = Number(to[1]);
  return rank === 8 || rank === 1;
}

function applyMove(from, to, promotion = "q") {
  const before = game.getPiece(to);
  const result = game.move(from, to, promotion);
  if (!result.ok) return result;
  playMoveSound();
  syncPieces();
  if (result.checkmate) {
    showGameOverOverlay(`Checkmate — ${game.turn === "white" ? "black" : "white"} wins`);
    showRestartOverlay(() => restart());
  } else if (result.stalemate) {
    showGameOverOverlay("Stalemate");
    showRestartOverlay(() => restart());
  } else if (vsAi && game.turn === "black") {
    window.setTimeout(runAi, 250);
  }
  return { ...result, captured: Boolean(before) };
}

function runAi() {
  if (busy || game.turn !== "black") return;
  const move = ai.makeMove();
  if (!move) return;
  applyMove(move.from, move.to, "q");
}

function restart() {
  ["gameOverOverlay", "promotionUI", "restartOverlay"].forEach((id) => {
    document.getElementById(id)?.remove();
  });
  game = new ChessRules();
  ai.chess = game;
  selected = null;
  clearHighlights();
  syncPieces();
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
  if (busy) return;
  const hit = pickSquare(event);
  if (!hit) {
    selected = null;
    clearHighlights();
    return;
  }
  if (hit.kind === "move") {
    const finish = (promo) => {
      busy = false;
      applyMove(hit.from, hit.to, promo);
      selected = null;
      clearHighlights();
    };
    if (needsPromotion(hit.from, hit.to)) {
      busy = true;
      showPromotionUI((label) => {
        const map = { Queen: "q", Rook: "r", Bishop: "b", Knight: "n" };
        finish(map[label] || "q");
      });
      return;
    }
    finish("q");
    return;
  }
  if (vsAi && game.turn === "black") return;
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

window.__chess = () => game;
