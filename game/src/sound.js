// sound.js — tiny WebAudio bleeps for Mountain Cabin Night. No audio files,
// no network: every sound is an oscillator envelope built at play time.

let ctx = null;
let muted = false;

export function setMuted(m) { muted = m; }

export function isMuted() { return muted; }

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, at, dur, type, vol) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type || 'sine';
  o.frequency.value = freq;
  const t0 = c.currentTime + at;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export function playFind() {
  tone(660, 0, 0.14, 'sine', 0.14);
  tone(880, 0.09, 0.2, 'sine', 0.14);
}

export function playWrong() {
  tone(140, 0, 0.22, 'sawtooth', 0.07);
}

export function playHint() {
  tone(520, 0, 0.1, 'triangle', 0.1);
  tone(620, 0.08, 0.12, 'triangle', 0.1);
}

export function playClear() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.22, 'sine', 0.13));
}

export function playWin() {
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.12, 0.3, 'sine', 0.13));
}

export function playClick() {
  tone(440, 0, 0.06, 'triangle', 0.07);
}
