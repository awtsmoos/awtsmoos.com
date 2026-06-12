import { audioAllowed } from '../settings/audioSettings.js';

/**
 * B"H
 * WebAudio feedback with charge-tier voices and category settings.
 *
 * Chapter 33: every impact now carries a different song. Tiny rapid strikes
 * chirp like sparks, charged blows descend like bronze doors, and wall crashes
 * answer with stone-thunder. The player may silence all, or keep only selected
 * families of sound.
 */
let ctx = null;
let lastFrameKey = '';
let lastTime = 0;

export function playEvents(events, state = null) {
  if (!events?.length || typeof window === 'undefined') return;
  const now = performance.now();
  if (now - lastTime < 12 && lastFrameKey === events.length + ':' + events[0]?.type) return;
  lastFrameKey = events.length + ':' + events[0]?.type;
  lastTime = now;
  const human = humanFighter(state);
  for (const event of events) playEvent(event, human);
}

export function shouldVibrateForEvent(event, human = null) {
  if (!event || event.noHaptic || !human) return false;
  if (event.human || event.playerLocal) return true;
  if (event.attackerId && event.attackerId === human.id) return true;
  if (event.targetId && event.targetId === human.id) return true;
  if (event.actorId && event.actorId === human.id) return true;
  if (event.ownerId && event.ownerId === human.id) return true;
  if (event.type === 'pickup' && event.fighterId === human.id) return true;
  return false;
}

function playEvent(event, human) {
  const haptic = shouldVibrateForEvent(event, human);
  if (event.type === 'hit' && audioAllowed('hit')) impact(event, haptic);
  else if (event.type === 'wall' && audioAllowed('wall')) wall(event.force || 12, haptic);
  else if (event.type === 'fall' && audioAllowed('fall')) fall(event.force || 60, haptic);
  else if (event.type === 'pickup' && audioAllowed('pickup')) chime(haptic);
}

function impact(event, haptic = false) {
  const force = event.force || event.damage || 8;
  const charge = Math.max(0, Math.min(1, event.charge || (event.fullCharge ? 1 : 0)));
  const power = Math.min(1, Math.max(0.12, force / 54));
  if (event.rapid) return rapidSound(power, haptic);
  if (charge > 0.88 || event.fullCharge) return maxChargeSound(power, haptic);
  if (charge > 0.45) return midChargeSound(charge, power, haptic);
  lightHitSound(power, haptic);
}

function lightHitSound(power, haptic) {
  tone(210 - power * 60, 0.038 + power * 0.03, 'square', 0.025 + power * 0.045);
  noise(0.025 + power * 0.035, 0.045 + power * 0.075);
  if (haptic) vibrate([Math.round(7 + power * 16)]);
}

function rapidSound(power, haptic) {
  tone(340 + power * 90, 0.022, 'square', 0.025);
  tone(520 + power * 80, 0.018, 'triangle', 0.014, 0.018);
  if (haptic) vibrate(6);
}

function midChargeSound(charge, power, haptic) {
  tone(150 - charge * 35, 0.075 + power * 0.04, 'sawtooth', 0.055 + power * 0.05);
  tone(300 + charge * 120, 0.06, 'triangle', 0.025, 0.035);
  noise(0.075, 0.09 + power * 0.08);
  if (haptic) vibrate([18, 18, Math.round(18 + charge * 26)]);
}

function maxChargeSound(power, haptic) {
  tone(64, 0.13, 'square', 0.095 + power * 0.04);
  tone(118, 0.11, 'sawtooth', 0.07, 0.018);
  tone(420, 0.06, 'triangle', 0.035, 0.06);
  noise(0.12, 0.18);
  if (haptic) vibrate([30, 22, 42, 18, 24]);
}

function wall(force, haptic = false) {
  const power = Math.min(1, force / 42);
  tone(88 + power * 60, 0.11, 'sawtooth', 0.06 + power * 0.055);
  tone(52 + power * 20, 0.16, 'square', 0.035 + power * 0.035, 0.015);
  noise(0.09 + power * 0.06, 0.12 + power * 0.12);
  if (haptic) vibrate([10, 12, Math.round(14 + power * 24)]);
}

function fall(force, haptic = false) {
  const power = Math.min(1, force / 72);
  tone(46, 0.22, 'sawtooth', 0.11);
  tone(92, 0.18, 'square', 0.07, 0.035);
  noise(0.18, 0.22 + power * 0.12);
  if (haptic) vibrate([38, 28, 48]);
}

function chime(haptic = false) {
  tone(520, 0.04, 'sine', 0.035);
  tone(780, 0.05, 'sine', 0.025, 0.035);
  if (haptic) vibrate(8);
}

function humanFighter(state) {
  return state?.fighters?.find(f => f.human && !f.dead) || state?.fighters?.find(f => f.human) || null;
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
  osc.frequency.setValueAtTime(Math.max(24, freq), t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(24, freq * 0.52), t + duration);
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
