import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createPieceMesh as createProceduralPiece } from "./procedural.js";

const TYPE_KEYS = {
  k: ["king"],
  q: ["queen"],
  r: ["castle", "rook"],
  n: ["knight"],
  b: ["bishop"],
  p: ["pawn"],
};

let templates = null;
let loadPromise = null;

function matchesType(name, type) {
  const lower = name.toLowerCase();
  return TYPE_KEYS[type].some((key) => lower.includes(key));
}

function matchesColor(name, color) {
  const lower = name.toLowerCase();
  if (color === "white") return lower.includes("white") || lower.endsWith("_w");
  return lower.includes("black") || lower.endsWith("_b");
}

function typeHeight(type) {
  return { p: 0.7, r: 0.78, n: 0.82, b: 0.92, q: 1.0, k: 1.05 }[type] || 0.8;
}

function prepareClone(source, type) {
  const clone = source.clone(true);
  clone.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
      if (obj.material) {
        obj.material = obj.material.clone();
        obj.material.envMapIntensity = 1.15;
      }
    }
  });
  const box = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  clone.position.sub(center);
  clone.position.y += size.y / 2;
  const scale = typeHeight(type) / Math.max(size.y, 0.001);
  clone.scale.setScalar(scale);
  const wrapped = new THREE.Group();
  wrapped.add(clone);
  return wrapped;
}

function collectTemplates(root) {
  const found = {
    white: { p: null, r: null, n: null, b: null, q: null, k: null },
    black: { p: null, r: null, n: null, b: null, q: null, k: null },
  };

  root.updateMatrixWorld(true);
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const label = `${obj.material.name || ""} ${obj.name || ""}`;
    for (const type of Object.keys(TYPE_KEYS)) {
      if (!matchesType(label, type)) continue;
      for (const color of ["white", "black"]) {
        if (!matchesColor(label, color)) continue;
        if (found[color][type]) continue;
        found[color][type] = obj.parent && obj.parent !== root ? obj.parent : obj;
      }
    }
  });

  const ready = { white: {}, black: {} };
  for (const color of ["white", "black"]) {
    for (const type of Object.keys(TYPE_KEYS)) {
      if (found[color][type]) ready[color][type] = prepareClone(found[color][type], type);
    }
  }
  return ready;
}

export function loadPieceLibrary(url = "/assets/pieces-staunton.glb") {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const timer = setTimeout(() => {
      console.warn("piece library load timed out, using procedural");
      templates = null;
      finish(null);
    }, 15000);
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        try {
          templates = collectTemplates(gltf.scene);
          clearTimeout(timer);
          finish(templates);
        } catch (err) {
          clearTimeout(timer);
          console.warn("piece library parse failed, using procedural", err);
          templates = null;
          finish(null);
        }
      },
      undefined,
      (err) => {
        clearTimeout(timer);
        console.warn("piece library load failed, using procedural", err);
        templates = null;
        finish(null);
      },
    );
  });
  return loadPromise;
}

export function createPieceMesh(type, color) {
  const template = templates?.[color]?.[type];
  if (template) {
    const mesh = template.clone(true);
    mesh.userData = { type, color };
    return mesh;
  }
  return createProceduralPiece(type, color);
}

export function piecesReady() {
  return Boolean(templates);
}
