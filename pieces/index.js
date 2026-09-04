import * as THREE from "three";

function lathePoints(profile) {
  return profile.map(([x, y]) => new THREE.Vector2(x, y));
}

function makeLathe(profile, material) {
  const geo = new THREE.LatheGeometry(lathePoints(profile), 24);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

const PROFILES = {
  p: [
    [0.0, 0.0],
    [0.28, 0.0],
    [0.28, 0.08],
    [0.18, 0.12],
    [0.16, 0.35],
    [0.2, 0.42],
    [0.12, 0.5],
    [0.14, 0.62],
    [0.0, 0.7],
  ],
  r: [
    [0.0, 0.0],
    [0.32, 0.0],
    [0.32, 0.1],
    [0.22, 0.14],
    [0.2, 0.55],
    [0.28, 0.58],
    [0.28, 0.72],
    [0.0, 0.72],
  ],
  n: [
    [0.0, 0.0],
    [0.3, 0.0],
    [0.3, 0.1],
    [0.2, 0.16],
    [0.18, 0.45],
    [0.26, 0.58],
    [0.2, 0.72],
    [0.0, 0.78],
  ],
  b: [
    [0.0, 0.0],
    [0.3, 0.0],
    [0.3, 0.1],
    [0.18, 0.16],
    [0.16, 0.55],
    [0.2, 0.68],
    [0.08, 0.82],
    [0.0, 0.9],
  ],
  q: [
    [0.0, 0.0],
    [0.34, 0.0],
    [0.34, 0.1],
    [0.2, 0.16],
    [0.18, 0.62],
    [0.28, 0.7],
    [0.16, 0.86],
    [0.0, 0.95],
  ],
  k: [
    [0.0, 0.0],
    [0.34, 0.0],
    [0.34, 0.1],
    [0.2, 0.16],
    [0.18, 0.62],
    [0.26, 0.72],
    [0.14, 0.88],
    [0.0, 0.98],
  ],
};

export function createPieceMesh(type, color) {
  const material = new THREE.MeshStandardMaterial({
    color: color === "white" ? 0xf3efe6 : 0x1c1c1c,
    roughness: color === "white" ? 0.35 : 0.45,
    metalness: 0.15,
  });
  const profile = PROFILES[type] || PROFILES.p;
  const mesh = makeLathe(profile, material);
  mesh.userData = { type, color };
  return mesh;
}
