let sharedCtx = null;

function ctx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx) sharedCtx = new Ctx();
  if (sharedCtx.state === "suspended") sharedCtx.resume();
  return sharedCtx;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function squarePan(square) {
  if (!square) return 0;
  const file = square.charCodeAt(0) - 97;
  return (file - 3.5) / 4.5;
}

export function renderWoodClick(sampleRate, opts = {}) {
  const duration = opts.duration ?? 0.09;
  const frames = Math.floor(sampleRate * duration);
  const data = new Float32Array(frames);
  const bright = opts.bright ?? 1800;
  const rand = mulberry32(opts.seed ?? 0x51a11e);
  for (let i = 0; i < frames; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 55) * (1 - t / duration);
    const click = Math.sin(2 * Math.PI * bright * t) * env * 0.35;
    const body = Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 28) * 0.2;
    const noise = (rand() * 2 - 1) * Math.exp(-t * 90) * 0.12;
    data[i] = click + body + noise;
  }
  return data;
}

export function renderThud(sampleRate, opts = {}) {
  const duration = opts.duration ?? 0.18;
  const frames = Math.floor(sampleRate * duration);
  const data = new Float32Array(frames);
  const rand = mulberry32(opts.seed ?? 0x7a11);
  for (let i = 0; i < frames; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 18);
    const low = Math.sin(2 * Math.PI * 90 * t) * env * 0.45;
    const mid = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 25) * 0.2;
    const grit = (rand() * 2 - 1) * Math.exp(-t * 40) * 0.18;
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

export function renderIllegal(sampleRate) {
  const duration = 0.12;
  const frames = Math.floor(sampleRate * duration);
  const data = new Float32Array(frames);
  for (let i = 0; i < frames; i += 1) {
    const t = i / sampleRate;
    data[i] =
      Math.sin(2 * Math.PI * 160 * t) * Math.exp(-t * 22) * 0.25 +
      Math.sin(2 * Math.PI * 140 * t) * Math.exp(-t * 18) * 0.15;
  }
  return data;
}

function playBuffer(data, gain = 0.7, pan = 0) {
  const audio = ctx();
  if (!audio) return;
  const buffer = audio.createBuffer(1, data.length, audio.sampleRate);
  buffer.copyToChannel(data, 0);
  const src = audio.createBufferSource();
  const g = audio.createGain();
  const filter = audio.createBiquadFilter();
  const panner = audio.createStereoPanner();
  filter.type = "lowpass";
  filter.frequency.value = 5200;
  panner.pan.value = Math.max(-1, Math.min(1, pan));
  src.buffer = buffer;
  g.gain.value = gain;
  src.connect(filter);
  filter.connect(panner);
  panner.connect(g);
  g.connect(audio.destination);
  src.start();
}

export function playMoveSound(square) {
  const audio = ctx();
  if (!audio) return;
  playBuffer(renderWoodClick(audio.sampleRate, { bright: 1650 }), 0.65, squarePan(square));
}

export function playCaptureSound(square) {
  const audio = ctx();
  if (!audio) return;
  const pan = squarePan(square);
  playBuffer(renderThud(audio.sampleRate), 0.75, pan);
  playBuffer(renderWoodClick(audio.sampleRate, { bright: 900, duration: 0.07 }), 0.35, pan);
}

export function playCheckSound() {
  const audio = ctx();
  if (!audio) return;
  playBuffer(renderChime(audio.sampleRate, [523.25, 659.25, 783.99]), 0.55);
}

export function playCastleSound() {
  const audio = ctx();
  if (!audio) return;
  playBuffer(renderWoodClick(audio.sampleRate, { bright: 1400 }), 0.5, -0.2);
  setTimeout(() => playBuffer(renderWoodClick(audio.sampleRate, { bright: 1200 }), 0.45, 0.2), 70);
}

export function playPromoteSound(square) {
  const audio = ctx();
  if (!audio) return;
  playBuffer(renderChime(audio.sampleRate, [392, 523.25, 659.25, 783.99], { duration: 0.4 }), 0.6, squarePan(square));
}

export function playIllegalSound() {
  const audio = ctx();
  if (!audio) return;
  playBuffer(renderIllegal(audio.sampleRate), 0.45);
}

export function playMateSound() {
  const audio = ctx();
  if (!audio) return;
  playBuffer(renderChime(audio.sampleRate, [261.63, 329.63, 392, 523.25], { duration: 0.55 }), 0.7);
}
