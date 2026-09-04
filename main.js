import * as THREE from 'three';

// Initialize the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);

// Create a chessboard geometry instead of a cube
const boardGeometry = new THREE.PlaneGeometry(8, 8);
const boardMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, side: THREE.DoubleSide });
const chessboard = new THREE.Mesh(boardGeometry, boardMaterial);
chessboard.rotation.x = -Math.PI / 2;
scene.add(chessboard);

// Create materials for Staunton-like pieces (not the final models)
const pieceMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const pawnGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.8, 32);
const pawn = new THREE.Mesh(pawnGeometry, pieceMaterial);

// Position the pawn on the board
pawn.position.set(0, 0.4, 0);
scene.add(pawn);

// Setup basic lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

camera.position.set(0, 5, 10);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();