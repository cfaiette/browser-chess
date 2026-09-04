import * as THREE from "three";

function woodMap(base, variance, size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);
  const [br, bg, bb] = base;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const grain = Math.sin(x * 0.35 + Math.sin(y * 0.08) * 3) * variance;
      const noise = ((x * 17 + y * 31) % 13) - 6;
      const i = (y * size + x) * 4;
      img.data[i] = Math.max(0, Math.min(255, br + grain + noise));
      img.data[i + 1] = Math.max(0, Math.min(255, bg + grain * 0.7 + noise * 0.5));
      img.data[i + 2] = Math.max(0, Math.min(255, bb + grain * 0.4));
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function labelTexture(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 64, 64);
  ctx.fillStyle = "#d8c7a6";
  ctx.font = "600 36px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 32, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createBoard(scene) {
  const root = new THREE.Group();
  root.name = "board";
  const lightMat = new THREE.MeshStandardMaterial({
    map: woodMap([232, 215, 187], 10),
    roughness: 0.34,
    metalness: 0.08,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    map: woodMap([63, 40, 28], 8),
    roughness: 0.44,
    metalness: 0.12,
  });
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const tile = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.12, 0.98), (file + rank) % 2 === 0 ? darkMat : lightMat);
      tile.position.set(file - 3.5, 0, rank - 3.5);
      tile.receiveShadow = true;
      tile.userData = { square: `${String.fromCharCode(97 + file)}${rank + 1}` };
      root.add(tile);
    }
  }
  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(8.7, 0.22, 8.7),
    new THREE.MeshStandardMaterial({
      map: woodMap([40, 24, 16], 6, 256),
      roughness: 0.55,
      metalness: 0.1,
    }),
  );
  rim.position.y = -0.1;
  rim.receiveShadow = true;
  root.add(rim);

  const bevel = new THREE.Mesh(
    new THREE.BoxGeometry(9.05, 0.08, 9.05),
    new THREE.MeshStandardMaterial({ color: 0x1a100c, roughness: 0.65, metalness: 0.05 }),
  );
  bevel.position.y = -0.22;
  bevel.receiveShadow = true;
  root.add(bevel);

  for (let file = 0; file < 8; file += 1) {
    const letter = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.28),
      new THREE.MeshBasicMaterial({ map: labelTexture(String.fromCharCode(97 + file)), transparent: true }),
    );
    letter.rotation.x = -Math.PI / 2;
    letter.position.set(file - 3.5, 0.07, -4.15);
    root.add(letter);
  }
  for (let rank = 0; rank < 8; rank += 1) {
    const num = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.28),
      new THREE.MeshBasicMaterial({ map: labelTexture(String(rank + 1)), transparent: true }),
    );
    num.rotation.x = -Math.PI / 2;
    num.position.set(-4.15, 0.07, rank - 3.5);
    root.add(num);
  }

  scene.add(root);
  return root;
}

export function squareToWorld(square) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  return new THREE.Vector3(file - 3.5, 0.08, rank - 3.5);
}

const listeners = new Map();

export function init(config = {}) {
  return { root: createBoard(config.scene) };
}

export function showcase(container) {
  if (container) container.textContent = "board: wood-grain PBR tiles + file/rank labels";
}

export function update() {}

export function on(event, handler) {
  const key = event.includes(":") ? event : `board:${event}`;
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key).add(handler);
}

export function off(event, handler) {
  listeners.get(event.includes(":") ? event : `board:${event}`)?.delete(handler);
}

export function destroy() {
  listeners.clear();
}
