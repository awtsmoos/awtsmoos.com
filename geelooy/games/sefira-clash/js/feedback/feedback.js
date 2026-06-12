/**
 * B"H
 * WebAudio and haptic feedback for arena impacts.
 *
 * Chapter 156: impact becomes sound and trembling. The browser receives tiny,
 * cheap oscillators and mobile vibration pulses so hits, walls, and smashes
 * strike the hand without expensive audio assets.
 */
let ctx = null;
let lastFrameKey = '';
let lastTime = 0;

export function playEvents(events) {
  if (!events?.length || typeof window === 'undefined') return;
  const now = performance.now();
  if (now - lastTime < 16 && lastFrameKey === events.length + ':' + events[0]?.type) return;
  lastFrameKey = events.length + ':' + events[0]?.type;
  lastTime = now;
  for (const event of events) playEvent(event);
}

function playEvent(event) {
  if (event.type === 'hit') impact(event.force || event.damage || 8, event.fullCharge || event.koDanger, event.shockwave);
  else if (event.type === 'wall') wall(event.force || 12);
  else if (event.type === 'pickup') chime();
}

function impact(force, huge = false, shock = false) {
  const power = Math.min(1, Math.max(0.15, force / 42));
  tone(huge ? 72 : shock ? 96 : 150 - power * 45, 0.05 + power * 0.045, 'square', 0.035 + power * 0.045);
  noise(0.035 + power * 0.045, 0.06 + power * 0.12);
  vibrate(huge ? [26, 22, 34] : shock ? [18, 18, 26] : [Math.round(8 + power * 18)]);
}

function wall(force) {
  const power = Math.min(1, force / 28);
  tone(180 + power * 90, 0.06, 'sawtooth', 0.04 + power * 0.04);
  vibrate([8, 12, Math.round(8 + power * 14)]);
}

function chime() {
  tone(520, 0.04, 'sine', 0.035);
  tone(780, 0.05, 'sine', 0.025, 0.035);
  vibrate(8);
}

function audio() {
  if (ctx) return ctx;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  ctx = new AudioContext();
  return ctx;
}

function tone(freq, duration, type, gain, delay = 0) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.55), t + duration);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function noise(duration, gain) {
  const ac = audio();
  if (!ac) return;
  const frames = Math.max(1, Math.floor(ac.sampleRate * duration));
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = ac.createBufferSource();
  const g = ac.createGain();
  g.gain.value = gain;
  src.buffer = buffer;
  src.connect(g).connect(ac.destination);
  src.start();
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}
