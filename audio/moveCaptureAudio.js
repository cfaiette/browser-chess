let sharedCtx = null;

function ctx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx) sharedCtx = new Ctx();
  if (sharedCtx.state === "suspended") sharedCtx.resume();
  return sharedCtx;
}

export function renderWoodClick(sampleRate, opts = {}) {
  const duration = opts.duration ?? 0.09;
  const frames = Math.floor(sampleRate * duration);
  const data = new Float32Array(frames);
  const bright = opts.bright ?? 1800;
  for (let i = 0; i < frames; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 55) * (1 - t / duration);
    const click = Math.sin(2 * Math.PI * bright * t) * env * 0.35;
    const body = Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 28) * 0.2;
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 90) * 0.12;
    data[i] = click + body + noise;
  }
  return data;
}

export function renderThud(sampleRate, opts = {}) {
  const duration = opts.duration ?? 0.18;
  const frames = Math.floor(sampleRate * duration);
  const data = new Float32Array(frames);
  for (let i = 0; i < frames; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 18);
    const low = Math.sin(2 * Math.PI * 90 * t) * env * 0.45;
    const mid = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 25) * 0.2;
    const grit = (Math.random() * 2 - 1) * Math.exp(-t * 40) * 0.18;
    data[i] = low + mid + grit;
  }
  return data;
}

export function renderChime(sampleRate, freqs, opts = {}) {
  const duration = opts.duration ?? 0.28;
  const frames = Math.floor(sampleRate * duration);
  const data = new Float32Array(frames);
  for (let i = 0; i < frames; i += 1) {
    const t = i / sampleRate;
    let sample = 0;
    freqs.forEach((f, idx) => {
      const delay = idx * 0.05;
      if (t < delay) return;
      const u = t - delay;
      sample += Math.sin(2 * Math.PI * f * u) * Math.exp(-u * 7) * (0.22 - idx * 0.03);
    });
    data[i] = sample;
  }
  return data;
}

function playBuffer(data, gain = 0.7) {
  const audio = ctx();
  if (!audio) return;
  const buffer = audio.createBuffer(1, data.length, audio.sampleRate);
  buffer.copyToChannel(data, 0);
  const src = audio.createBufferSource();
  const g = audio.createGain();
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 5200;
  src.buffer = buffer;
  g.gain.value = gain;
  src.connect(filter);
  filter.connect(g);
  g.connect(audio.destination);
  src.start();
}

export function playMoveSound() {
  const audio = ctx();
  if (!audio) return;
  playBuffer(renderWoodClick(audio.sampleRate, { bright: 1650 }), 0.65);
}

export function playCaptureSound() {
  const audio = ctx();
  if (!audio) return;
  playBuffer(renderThud(audio.sampleRate), 0.75);
  playBuffer(renderWoodClick(audio.sampleRate, { bright: 900, duration: 0.07 }), 0.35);
}

export function playCheckSound() {
  const audio = ctx();
  if (!audio) return;
  playBuffer(renderChime(audio.sampleRate, [523.25, 659.25, 783.99]), 0.55);
}

export function playCastleSound() {
  const audio = ctx();
  if (!audio) return;
  playBuffer(renderWoodClick(audio.sampleRate, { bright: 1400 }), 0.5);
  setTimeout(() => playBuffer(renderWoodClick(audio.sampleRate, { bright: 1200 }), 0.45), 70);
}

export function playPromoteSound() {
  const audio = ctx();
  if (!audio) return;
  playBuffer(renderChime(audio.sampleRate, [392, 523.25, 659.25, 783.99], { duration: 0.4 }), 0.6);
}
