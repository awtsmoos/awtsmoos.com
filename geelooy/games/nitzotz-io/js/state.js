// B"H
import { createLevel, WORLDS } from './level.js';
import { createPerformanceState } from './performance.js';
import { loadSave } from './save.js';

export const SEFIROT = [['Malchus', 'Begin'], ['Chesed', 'Wider pull'], ['Gevurah', 'Tougher vessels'], ['Tiferes', 'Combo harmony'], ['Netzach', 'Speed surge'], ['Chochmah', 'Radar'], ['Keser', 'World gate']];

/** B"H: The traveler begins fast; the frame governor guards the breath. */
export function createWorld() {
  const save = loadSave();
  const level = createLevel(save, save.completed.length % WORLDS.length);
  return { mode: 'ready', save, level, performance: createPerformanceState(), player: player(), camera: camera(), input: { x: 0, y: 0, pulse: 0 }, particles: [], absorbers: [], floaters: [], events: [], score: 0, timeLeft: level.time, won: false, lost: false, sefirah: 0, message: 'B"H · High-speed ascent in ' + level.name + '. Best ' + save.best + '.' };
}

export function addBurst(world, object) {
  const q = world.performance?.scale ?? 1;
  const base = world.save.perf === 'low' ? 8 : world.save.perf === 'high' ? 28 : 16;
  for (let i = 0; i < Math.ceil(base * q); i += 1) world.particles.push({ x: object.x, y: object.y, z: object.z + object.h * 0.55, vx: (Math.random() - 0.5) * 330, vy: (Math.random() - 0.5) * 330, vz: 120 + Math.random() * 230, life: 0.7 + Math.random() * 0.8, r: 2.6 + Math.random() * 5.8, hue: object.hue });
}

export function addText(world, x, y, z, text) {
  if ((world.performance?.scale ?? 1) > 0.5) world.floaters.push({ x, y, z, text, life: 1.05 });
}

function player() {
  return { x: 0, y: 0, z: 0, r: 22, h: 36, speed: 470, glow: 0.2, combo: 1, comboT: 0 };
}

function camera() {
  return { x: 0, y: -760, z: 560, targetZ: 24, angle: 0, distance: 760, shake: 0, victory: 0 };
}
