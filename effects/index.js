import * as THREE from "three";
import { squareToWorld } from "../board/index.js";

export function createEffectsLayer() {
  const root = new THREE.Group();
  root.name = "effects";

  function clear() {
    while (root.children.length) root.remove(root.children[0]);
  }

  function ring(square, color, opacity = 0.75, y = 0.17) {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.36, 0.5, 40),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide }),
    );
    const pos = squareToWorld(square);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(pos.x, y, pos.z);
    root.add(mesh);
    return mesh;
  }

  function showLastMove(from, to) {
    clear();
    if (from) ring(from, 0x6ea8ff, 0.35, 0.13);
    if (to) ring(to, 0x6ea8ff, 0.55, 0.14);
  }

  function showCheck(square) {
    if (!square) return;
    ring(square, 0xff5a5a, 0.85, 0.18);
  }

  return { root, clear, showLastMove, showCheck };
}
