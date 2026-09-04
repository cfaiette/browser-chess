import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { ChessRules } from "./chess/rules.js";
import { SimpleAI } from "./chess/ai.js";
import { createBoard, squareToWorld } from "./board/index.js";
import { createPieceMesh, loadPieceLibrary } from "./pieces/index.js";
import { createCamera } from "./camera/index.js";
import { createEffectsLayer } from "./effects/index.js";
import { playMoveSound, playCaptureSound, playCheckSound, playCastleSound, playPromoteSound, playMateSound } from "./audio/moveCaptureAudio.js";
import { showPromotionUI } from "./ui/promotionUI.js";
import { showGameOverOverlay } from "./ui/gameOverOverlay.js";
import { showRestartOverlay } from "./ui/restartOverlay.js";

const app = document.getElementById("app");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e13);
scene.fog = new THREE.Fog(0x0b0e13, 16, 34);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.appendChild(renderer.domElement);

const cam = createCamera(renderer);
const { camera, controls } = cam;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

scene.add(new THREE.HemisphereLight(0xf8f2e8, 0x1a120c, 0.45));
const key = new THREE.DirectionalLight(0xfff1dc, 1.45);
key.position.set(6, 12, 4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0002;
scene.add(key);
const fill = new THREE.DirectionalLight(0xb8d0ff, 0.4);
fill.position.set(-7, 6, -4);
scene.add(fill);
const rim = new THREE.PointLight(0xffc9a1, 0.55, 30);
rim.position.set(-2, 3, 6);
scene.add(rim);

const table = new THREE.Mesh(
  new THREE.CylinderGeometry(7.2, 7.4, 0.35, 64),
  new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.75, metalness: 0.05 }),
);
table.position.y = -0.28;
table.receiveShadow = true;
scene.add(table);

createBoard(scene);
const effects = createEffectsLayer();
scene.add(effects.root);
let game = new ChessRules();
const ai = new SimpleAI(game);
const pieces = new THREE.Group();
scene.add(pieces);

const statusEl = document.createElement("div");
statusEl.style.cssText =
  "position:fixed;left:16px;bottom:16px;padding:10px 12px;background:#0f141bcc;color:#f4f1ea;font:14px/1.4 Georgia,serif;border:1px solid #334;border-radius:8px;z-index:5;";
document.body.appendChild(statusEl);

const vsAiFlag = { enabled: true };
let selected = null;
let busy = false;
let anim = null;
const highlights = new THREE.Group();
scene.add(highlights);
const selection = new THREE.Group();
scene.add(selection);

function kingSquare(color) {
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const piece = game.board[rank][file];
      if (piece?.type === "k" && piece.color === color) {
        return `${String.fromCharCode(97 + file)}${rank + 1}`;
      }
    }
  }
  return null;
}

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
  if (game.inCheck()) effects.showCheck(kingSquare(game.turn));
  statusEl.textContent = `${game.turn} to move · ${game.fen()}`;
}

function clearHighlights() {
  highlights.clear();
  selection.clear();
}

function showMoves(from) {
  clearHighlights();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.38, 0.48, 32),
    new THREE.MeshBasicMaterial({ color: 0xf0d78c, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
  );
  const fromPos = squareToWorld(from);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(fromPos.x, 0.16, fromPos.z);
  selection.add(ring);
  for (const to of game.legalMoves(from)) {
    const marker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.035, 24),
      new THREE.MeshBasicMaterial({ color: 0x7dd3a7, transparent: true, opacity: 0.72 }),
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

function finishAfterMove(result) {
  syncPieces();
  busy = false;
  if (result.checkmate) {
    showGameOverOverlay(`Checkmate — ${game.turn === "white" ? "black" : "white"} wins`);
    showRestartOverlay(() => restart());
  } else if (result.stalemate) {
    showGameOverOverlay("Stalemate");
    showRestartOverlay(() => restart());
  } else if (vsAiFlag.enabled && game.turn === "black") {
    window.setTimeout(runAi, 280);
  }
}

function applyMove(from, to, promotion = "q") {
  const before = game.getPiece(to);
  const mover = game.getPiece(from);
  const movingMesh = pieces.children.find((child) => child.userData.square === from);
  const fromPos = squareToWorld(from);
  const toPos = squareToWorld(to);
  const result = game.move(from, to, promotion);
  if (!result.ok) return result;
  const isCastle = mover?.type === "k" && Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) === 2;
  const isPromote = mover?.type === "p" && (to[1] === "8" || to[1] === "1");
  if (before) playCaptureSound(to);
  else if (isCastle) playCastleSound();
  else if (isPromote) playPromoteSound(to);
  else playMoveSound(to);
  if (result.checkmate) playMateSound();
  else if (result.check) playCheckSound();
  clearHighlights();
  selected = null;
  effects.showLastMove(from, to);
  if (movingMesh) {
    busy = true;
    anim = {
      mesh: movingMesh,
      x0: fromPos.x,
      z0: fromPos.z,
      x1: toPos.x,
      z1: toPos.z,
      t: 0,
      dur: 0.22,
      after: () => finishAfterMove(result),
    };
  } else {
    finishAfterMove(result);
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
  effects.clear();
  syncPieces();
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function pickSquare(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects([...pieces.children, ...highlights.children], true);
  if (!hits.length) return null;
  let obj = hits[0].object;
  while (obj && !obj.userData?.square && !obj.userData?.to && obj.parent) obj = obj.parent;
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
  if (vsAiFlag.enabled && game.turn === "black") return;
  const piece = game.getPiece(hit.square);
  if (!piece || piece.color !== game.turn) return;
  selected = hit.square;
  showMoves(selected);
});

window.addEventListener("resize", () => {
  cam.resize();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "f" || event.key === "F") cam.flip();
  if (event.key === "Escape") {
    selected = null;
    clearHighlights();
  }
  if (event.key === "r" || event.key === "R") restart();
});

statusEl.title = "Keys: F flip camera · Esc clear · R restart";

syncPieces();

function animate() {
  requestAnimationFrame(animate);
  if (anim) {
    anim.t += 1 / 60;
    const u = Math.min(1, anim.t / anim.dur);
    const e = 1 - (1 - u) ** 3;
    anim.mesh.position.x = anim.x0 + (anim.x1 - anim.x0) * e;
    anim.mesh.position.z = anim.z0 + (anim.z1 - anim.z0) * e;
    anim.mesh.position.y = 0.06 + Math.sin(Math.PI * e) * 0.35;
    if (u >= 1) {
      const done = anim.after;
      anim = null;
      done();
    }
  }
  cam.update();
  renderer.render(scene, camera);
}
animate();

window.__chess = () => game;
window.__chessSync = () => syncPieces();
window.__applyMove = (from, to, promotion = "q") => applyMove(from, to, promotion);
window.__setVsAi = (enabled) => {
  vsAiFlag.enabled = Boolean(enabled);
};
window.__flipCamera = () => cam.flip();
window.__setCamera = (x, y, z, tx = 0, ty = 0.35, tz = 0) => {
  cam.setView(x, y, z, tx, ty, tz);
  renderer.render(scene, camera);
};
window.__ready = true;

loadPieceLibrary().then((lib) => {
  window.__piecesReady = Boolean(lib);
  if (lib) syncPieces();
});
window.__piecesReady = false;
