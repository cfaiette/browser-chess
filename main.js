// Entry point for Vite and all modules
import './rendering';
import './board';
import './pieces';
import './chess';
import './camera';
import './interaction';
import './animation';
import './effects';
import './ai';
import './ui';
import './audio';

const appDiv = document.getElementById('app');
if (appDiv) {
  appDiv.innerHTML = '<h1>Browser Chess (AAA 3D)</h1>';
}

// Minimal startup; each subsystem is responsible for its own init/showcase
// Real run logic will connect modules & progress game state according to ARCHITECTURE.md
