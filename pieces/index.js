import * as THREE from "three";

function lathePoints(profile) {
  return profile.map(([x, y]) => new THREE.Vector2(x, y));
}

function makeLathe(profile, material, segments = 48) {
  const geo = new THREE.LatheGeometry(lathePoints(profile), segments);
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
    envMapIntensity: 1.1,
  });
}

const PROFILES = {
  p: [
    [0.0, 0.0],
    [0.32, 0.0],
    [0.32, 0.06],
    [0.22, 0.1],
    [0.16, 0.32],
    [0.2, 0.4],
    [0.11, 0.48],
    [0.14, 0.6],
    [0.0, 0.68],
  ],
  r: [
    [0.0, 0.0],
    [0.36, 0.0],
    [0.36, 0.08],
    [0.24, 0.13],
    [0.2, 0.5],
    [0.32, 0.54],
    [0.32, 0.66],
    [0.0, 0.66],
  ],
  b: [
    [0.0, 0.0],
    [0.34, 0.0],
    [0.34, 0.08],
    [0.2, 0.14],
    [0.15, 0.5],
    [0.2, 0.64],
    [0.07, 0.82],
    [0.0, 0.88],
  ],
  q: [
    [0.0, 0.0],
    [0.38, 0.0],
    [0.38, 0.08],
    [0.22, 0.14],
    [0.17, 0.58],
    [0.28, 0.68],
    [0.12, 0.86],
    [0.0, 0.92],
  ],
  k: [
    [0.0, 0.0],
    [0.38, 0.0],
    [0.38, 0.08],
    [0.22, 0.14],
    [0.17, 0.58],
    [0.26, 0.7],
    [0.12, 0.86],
    [0.0, 0.92],
  ],
};

function addRookBattlements(group, material) {
  for (let i = 0; i < 6; i += 1) {
    const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.1), material);
    const a = (i / 6) * Math.PI * 2;
    merlon.position.set(Math.cos(a) * 0.24, 0.72, Math.sin(a) * 0.24);
    merlon.castShadow = true;
    group.add(merlon);
  }
}

function addKingCross(group, material) {
  const upright = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.3, 0.07), material);
  upright.position.y = 1.06;
  upright.castShadow = true;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.07), material);
  bar.position.y = 1.1;
  bar.castShadow = true;
  group.add(upright, bar);
}

function addBishopMitre(group, material) {
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), material);
  tip.position.y = 0.92;
  tip.castShadow = true;
  const slit = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.18, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6, metalness: 0 }),
  );
  slit.position.set(0.04, 0.78, 0);
  group.add(tip, slit);
}

function addQueenCrown(group, material) {
  for (let i = 0; i < 5; i += 1) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.16, 8), material);
    const a = (i / 5) * Math.PI * 2;
    spike.position.set(Math.cos(a) * 0.14, 0.98, Math.sin(a) * 0.14);
    spike.castShadow = true;
    group.add(spike);
  }
}

function makeKnight(material) {
  const group = new THREE.Group();
  const base = makeLathe(
    [
      [0.0, 0.0],
      [0.34, 0.0],
      [0.34, 0.08],
      [0.22, 0.14],
      [0.18, 0.32],
    ],
    material,
  );
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.28, 16), material);
  neck.position.set(0.02, 0.46, 0);
  neck.rotation.z = -0.35;
  neck.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), material);
  head.scale.set(1.15, 0.85, 0.7);
  head.position.set(0.12, 0.66, 0);
  head.castShadow = true;
  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 12), material);
  snout.rotation.z = -Math.PI / 2;
  snout.position.set(0.28, 0.62, 0);
  snout.castShadow = true;
  const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 8), material);
  ear.position.set(0.08, 0.8, 0.04);
  ear.castShadow = true;
  group.add(base, neck, head, snout, ear);
  return group;
}

export function createPieceMesh(type, color) {
  const material = woodMaterial(
    color === "white" ? 0xf7f1e6 : 0x141416,
    color === "white" ? 0.22 : 0.36,
    color === "white" ? 0.28 : 0.2,
  );
  if (type === "n") {
    const knight = makeKnight(material);
    knight.userData = { type, color };
    return knight;
  }
  const profile = PROFILES[type] || PROFILES.p;
  const body = makeLathe(profile, material);
  const group = new THREE.Group();
  group.add(body);
  if (type === "r") addRookBattlements(group, material);
  if (type === "k") addKingCross(group, material);
  if (type === "b") addBishopMitre(group, material);
  if (type === "q") addQueenCrown(group, material);
  group.userData = { type, color };
  return group;
}
