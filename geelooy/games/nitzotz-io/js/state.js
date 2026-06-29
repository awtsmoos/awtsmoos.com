// B"H
import { createLevel, WORLDS } from './level.js';
import { loadSave } from './save.js';

export const SEFIROT = [['Malchus', 'Begin'], ['Chesed', 'Wider pull'], ['Gevurah', 'Tougher vessels'], ['Tiferes', 'Combo harmony'], ['Netzach', 'Speed surge'], ['Chochmah', 'Radar'], ['Keser', 'World gate']];

/** B"H: Initial state now places the camera above the world, not inside it. */
export function createWorld() {
  const save = loadSave();
  const level = createLevel(save, save.completed.length % WORLDS.length);
  return { mode: 'ready', save, level, player: player(), camera: camera(), input: { x: 0, y: 0, pulse: 0 }, particles: [], absorbers: [], floaters: [], events: [], score: 0, timeLeft: level.time, won: false, lost: false, sefirah: 0, message: 'B"H · Begin ' + level.name + '. Best ' + save.best + '.' };
}

export function addBurst(world, object) {
  const max = world.save.perf === 'low' ? 6 : world.save.perf === 'high' ? 18 : 11;
  for (let i = 0; i < max; i += 1) world.particles.push({ x: object.x, y: object.y, z: object.z + object.h * 0.5, vx: (Math.random() - 0.5) * 190, vy: (Math.random() - 0.5) * 190, vz: 80 + Math.random() * 145, life: 0.65 + Math.random() * 0.7, r: 2.5 + Math.random() * 4.5, hue: object.hue });
}

export function addText(world, x, y, z, text) {
  world.floaters.push({ x, y, z, text, life: 1.1 });
}

function player() {
  return { x: 0, y: 0, z: 0, r: 24, h: 38, speed: 275, glow: 0, combo: 1, comboT: 0 };
}

function camera() {
  return { x: 0, y: -720, z: 520, targetZ: 24, angle: 0, distance: 720, shake: 0, victory: 0 };
}
