// B"H

/**
 * B"H
 * The Awtsmoos gives every frame its breath; this keeper sheds beauty before breath is lost.
 */
export function createPerformanceState() {
  return { fps: 60, ms: 16.7, scale: 1, stress: 0, commands: 0, postfx: true, mapEvery: 2, frame: 0 };
}

export function updatePerformance(perf, dt, commands = perf.commands) {
  const ms = Math.max(1, dt * 1000);
  perf.ms = mix(perf.ms || ms, ms, 0.08);
  perf.fps = mix(perf.fps || 60, 1000 / ms, 0.08);
  perf.commands = commands;
  const overMs = Math.max(0, perf.ms - 16.2) / 15;
  const overDraw = Math.max(0, commands - 520) / 500;
  perf.stress = clamp(mix(perf.stress || 0, Math.max(overMs, overDraw), 0.12), 0, 1);
  perf.scale = clamp(1 - perf.stress * 0.58, 0.42, 1);
  perf.postfx = perf.stress < 0.36;
  perf.mapEvery = perf.stress > 0.55 ? 8 : perf.stress > 0.28 ? 4 : 2;
}

export function quality(world) {
  return world.performance?.scale ?? 1;
}

function mix(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
