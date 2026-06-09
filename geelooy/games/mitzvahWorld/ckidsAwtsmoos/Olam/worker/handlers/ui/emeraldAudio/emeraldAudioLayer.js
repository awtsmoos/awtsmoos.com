// B"H
/**
 * @file emeraldAudioLayer.js
 * @description Chapter 504: Synthetic ambience layers map birds, wind, market,
 * water, and tree-glow labels into gentle oscillators/noise.
 */
function gain(ctx, volume) { const g = ctx.createGain(); g.gain.value = volume; g.connect(ctx.destination); return g; }
function oscillatorLayer(ctx, freq, type, volume) { const o = ctx.createOscillator(), g = gain(ctx, volume); o.type = type; o.frequency.value = freq; o.connect(g); o.start(); return [o, g]; }
export function createEmeraldAudioLayer(ctx, label, volume = 0.1) {
  if (/birds/i.test(label)) return oscillatorLayer(ctx, 980, 'sine', volume * 0.12);
  if (/wind/i.test(label)) return oscillatorLayer(ctx, 96, 'triangle', volume * 0.08);
  if (/market/i.test(label)) return oscillatorLayer(ctx, 210, 'sawtooth', volume * 0.035);
  if (/water/i.test(label)) return oscillatorLayer(ctx, 144, 'triangle', volume * 0.1);
  if (/glow|tree/i.test(label)) return oscillatorLayer(ctx, 432, 'sine', volume * 0.075);
  return oscillatorLayer(ctx, 260, 'sine', volume * 0.04);
}
