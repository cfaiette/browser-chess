import * as THREE from "three";

function lathePoints(profile) {
  return profile.map(([x, y]) => new THREE.Vector2(x, y));
}

function makeLathe(profile, material) {
  const geo = new THREE.LatheGeometry(lathePoints(profile), 32);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function woodMaterial(color, roughness, metalness) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    envMapIntensity: 0.85,
  });
}

const PROFILES = {
  p: [
    [0.0, 0.0],
    [0.3, 0.0],
    [0.3, 0.07],
    [0.2, 0.11],
    [0.17, 0.34],
    [0.22, 0.42],
    [0.12, 0.5],
    [0.15, 0.62],
    [0.0, 0.7],
  ],
  r: [
    [0.0, 0.0],
    [0.34, 0.0],
    [0.34, 0.09],
    [0.23, 0.14],
    [0.2, 0.52],
    [0.3, 0.56],
    [0.3, 0.68],
    [0.0, 0.68],
  ],
  n: [
    [0.0, 0.0],
    [0.32, 0.0],
    [0.32, 0.09],
    [0.22, 0.15],
    [0.18, 0.4],
    [0.28, 0.55],
    [0.18, 0.72],
    [0.0, 0.78],
  ],
  b: [
    [0.0, 0.0],
    [0.32, 0.0],
    [0.32, 0.09],
    [0.19, 0.15],
    [0.16, 0.52],
    [0.22, 0.66],
    [0.08, 0.84],
    [0.0, 0.9],
  ],
  q: [
    [0.0, 0.0],
    [0.36, 0.0],
    [0.36, 0.09],
    [0.21, 0.15],
    [0.18, 0.6],
    [0.3, 0.7],
    [0.14, 0.88],
    [0.0, 0.96],
  ],
  k: [
    [0.0, 0.0],
    [0.36, 0.0],
    [0.36, 0.09],
    [0.21, 0.15],
    [0.18, 0.6],
    [0.28, 0.72],
    [0.14, 0.88],
    [0.0, 0.96],
  ],
};

function addRookBattlements(group, material) {
  for (let i = 0; i < 4; i += 1) {
    const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), material);
    const a = (i / 4) * Math.PI * 2;
    merlon.position.set(Math.cos(a) * 0.22, 0.74, Math.sin(a) * 0.22);
    merlon.castShadow = true;
    group.add(merlon);
  }
}

function addKingCross(group, material) {
  const upright = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.08), material);
  upright.position.y = 1.08;
  upright.castShadow = true;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.08), material);
  bar.position.y = 1.12;
  bar.castShadow = true;
  group.add(upright, bar);
}

function addBishopMitre(group, material) {
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), material);
  tip.position.y = 0.94;
  tip.castShadow = true;
  group.add(tip);
}

export function createPieceMesh(type, color) {
  const material = woodMaterial(
    color === "white" ? 0xf4efe4 : 0x1a1a1c,
    color === "white" ? 0.28 : 0.4,
    color === "white" ? 0.22 : 0.18,
  );
  const profile = PROFILES[type] || PROFILES.p;
  const body = makeLathe(profile, material);
  const group = new THREE.Group();
  group.add(body);
  if (type === "r") addRookBattlements(group, material);
  if (type === "k") addKingCross(group, material);
  if (type === "b") addBishopMitre(group, material);
  group.userData = { type, color };
  return group;
}
