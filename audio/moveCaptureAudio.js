let sharedCtx = null;

function ctx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx) sharedCtx = new Ctx();
  if (sharedCtx.state === "suspended") sharedCtx.resume();
  return sharedCtx;
}

function tone(frequency, duration, type = "sine", gain = 0.06, when = 0) {
  const audio = ctx();
  if (!audio) return;
  const t0 = audio.currentTime + when;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t0);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function noiseBurst(duration, gain = 0.04) {
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
  filter.frequency.value = 900;
  filter.Q.value = 0.8;
  src.buffer = buffer;
  g.gain.value = gain;
  src.connect(filter);
  filter.connect(g);
  g.connect(audio.destination);
  src.start();
}

export function playMoveSound() {
  tone(420, 0.07, "triangle", 0.045);
  tone(640, 0.09, "sine", 0.025, 0.03);
}

export function playCaptureSound() {
  noiseBurst(0.12, 0.05);
  tone(220, 0.14, "square", 0.035);
  tone(140, 0.18, "sawtooth", 0.02, 0.02);
}

export function playCheckSound() {
  tone(520, 0.08, "sine", 0.04);
  tone(780, 0.12, "triangle", 0.035, 0.08);
}
