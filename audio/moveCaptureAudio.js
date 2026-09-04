let sharedCtx = null;

function ctx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx) sharedCtx = new Ctx();
  if (sharedCtx.state === "suspended") sharedCtx.resume();
  return sharedCtx;
}

function tone(frequency, duration, type = "sine", gain = 0.06, when = 0, dest = null) {
  const audio = ctx();
  if (!audio) return;
  const t0 = audio.currentTime + when;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t0);
  g.gain.setValueAtTime(Math.max(gain, 0.0001), t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(dest || audio.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function noiseBurst(duration, gain = 0.04, centerHz = 900, dest = null) {
  const audio = ctx();
  if (!audio) return;
  const frames = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, frames, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const src = audio.createBufferSource();
  const g = audio.createGain();
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = centerHz;
  filter.Q.value = 0.85;
  src.buffer = buffer;
  g.gain.value = gain;
  src.connect(filter);
  filter.connect(g);
  g.connect(dest || audio.destination);
  src.start();
}

function bus() {
  const audio = ctx();
  if (!audio) return null;
  const g = audio.createGain();
  g.gain.value = 0.9;
  g.connect(audio.destination);
  return g;
}

export function playMoveSound() {
  const out = bus();
  noiseBurst(0.04, 0.028, 1800, out);
  tone(380, 0.05, "triangle", 0.04, 0, out);
  tone(610, 0.08, "sine", 0.02, 0.025, out);
}

export function playCaptureSound() {
  const out = bus();
  noiseBurst(0.14, 0.055, 650, out);
  tone(210, 0.12, "square", 0.03, 0, out);
  tone(130, 0.16, "sawtooth", 0.018, 0.03, out);
  tone(90, 0.2, "sine", 0.015, 0.05, out);
}

export function playCheckSound() {
  const out = bus();
  tone(494, 0.07, "sine", 0.035, 0, out);
  tone(740, 0.1, "triangle", 0.03, 0.07, out);
  tone(988, 0.12, "sine", 0.022, 0.14, out);
}

export function playCastleSound() {
  const out = bus();
  playMoveSound();
  tone(290, 0.06, "triangle", 0.03, 0.08, out);
  tone(440, 0.08, "sine", 0.02, 0.12, out);
}

export function playPromoteSound() {
  const out = bus();
  tone(523, 0.08, "sine", 0.035, 0, out);
  tone(659, 0.09, "triangle", 0.03, 0.07, out);
  tone(784, 0.12, "sine", 0.028, 0.14, out);
}
