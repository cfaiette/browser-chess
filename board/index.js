import * as THREE from "three";

export function createBoard(scene) {
  const root = new THREE.Group();
  root.name = "board";
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xd6c2a0,
    roughness: 0.45,
    metalness: 0.05,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x5b3a29,
    roughness: 0.55,
    metalness: 0.08,
  });
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const tile = new THREE.Mesh(new THREE.BoxGeometry(1, 0.12, 1), (file + rank) % 2 === 0 ? darkMat : lightMat);
      tile.position.set(file - 3.5, 0, rank - 3.5);
      tile.receiveShadow = true;
      tile.userData = { square: `${String.fromCharCode(97 + file)}${rank + 1}` };
      root.add(tile);
    }
  }
  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(8.6, 0.18, 8.6),
    new THREE.MeshStandardMaterial({ color: 0x2b1a12, roughness: 0.7 }),
  );
  rim.position.y = -0.08;
  rim.receiveShadow = true;
  root.add(rim);
  scene.add(root);
  return root;
}

export function squareToWorld(square) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  return new THREE.Vector3(file - 3.5, 0.08, rank - 3.5);
}
