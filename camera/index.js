import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function createCamera(renderer, target = new THREE.Vector3(0, 0.35, 0)) {
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 9.5, 11.5);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.48;
  let facingWhite = true;
  return {
    camera,
    controls,
    facingWhite: () => facingWhite,
    setView(x, y, z, tx = 0, ty = 0.35, tz = 0) {
      camera.position.set(x, y, z);
      controls.target.set(tx, ty, tz);
      controls.update();
    },
    flip() {
      facingWhite = !facingWhite;
      const z = facingWhite ? 11.5 : -11.5;
      camera.position.set(0, 9.5, z);
      controls.target.set(0, 0.35, 0);
      controls.update();
    },
    resize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    },
    update() {
      controls.update();
    },
    showcase(container) {
      if (container) container.textContent = "camera: orbit + flip";
    },
  };
}
