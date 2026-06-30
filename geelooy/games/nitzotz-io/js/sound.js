// B"H

/** Create a tiny synth that makes actions feel alive without assets. */
export function createSound(world) {
  let ctx;
  const ensure = () => ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)());
  return { event: event => handleEvent(event, world, ensure) };
}

function handleEvent(event, world, ensure) {
  if (event[0] === 'start') return tone(ensure, 330, 0.12);
  if (event[0] === 'pulse') return pulse(world, ensure);
  if (event[0] === 'reveal') return reveal(world, ensure, event[1]);
  if (event[0] === 'hazard') return hazard(world, ensure);
  if (event[0] === 'upgrade') return upgrade(world, ensure);
  if (event[0] === 'win') return win(world, ensure);
  if (event[0] === 'lose') return tone(ensure, 120, 0.4, 'triangle', 0.04);
}

function pulse(world, ensure) {
  tone(ensure, 180, 0.18, 'triangle', 0.06);
  vibrate(world, 14);
}

function reveal(world, ensure, sparks) {
  tone(ensure, 420 + Math.min(sparks, 430), 0.09, 'sine', 0.035);
  vibrate(world, Math.min(42, 9 + sparks / 7));
}

function hazard(world, ensure) {
  tone(ensure, 94, 0.13, 'sawtooth', 0.055);
  setTimeout(() => tone(ensure, 72, 0.18, 'triangle', 0.035), 90);
  vibrate(world, [60, 25, 80]);
}

function upgrade(world, ensure) {
  tone(ensure, 660, 0.12, 'sawtooth', 0.045);
  setTimeout(() => tone(ensure, 990, 0.16), 80);
  vibrate(world, 55);
}

function win(world, ensure) {
  [523, 659, 784, 1046].forEach((freq, index) => setTimeout(() => tone(ensure, freq, 0.18), index * 110));
  vibrate(world, [80, 40, 120]);
}

function tone(ensure, freq, dur, type = 'sine', gain = 0.05) {
  const ctx = ensure(), osc = ctx.createOscillator(), amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.value = gain;
  osc.connect(amp); amp.connect(ctx.destination);
  osc.start(); amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.stop(ctx.currentTime + dur);
}

function vibrate(world, value) {
  if (world.save.haptics && navigator.vibrate) navigator.vibrate(value);
}
