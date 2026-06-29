// B"H
import { createAwtsmoosEngine } from './engine/engine.js';
import { objectBudget, streamRadius } from './save.js';

export const WORLDS = [['Assiyah', 42, 1], ['Yetzirah', 188, 1.32], ['Beriah', 265, 1.7], ['Atzilus', 310, 2.2]];

/** B"H: Faster, denser worlds demand decisive gathering before time closes. */
export function createLevel(save, worldIndex = 0) {
  const awts = createAwtsmoosEngine();
  const world = WORLDS[worldIndex % WORLDS.length];
  const streamer = awts.streamer(worldIndex, objectBudget(save.perf), streamRadius(save.perf));
  const objects = streamer.update(0, 0);
  const pressure = save.perf === 'high' ? 0.88 : save.perf === 'low' ? 1.08 : 1;
  return { name: world[0], worldIndex, target: Math.round(7600 * world[2]), time: Math.round(95 * pressure), bounds: 6000, objects, streamer, neighborhoods: hoods(objects), hue: world[1], engine: 'AwtsmoosEngine-0.4-intense-realism' };
}

export function updateLevelStream(level, x, y) {
  level.objects = level.streamer.update(x, y);
  level.neighborhoods = hoods(level.objects);
  return level.objects;
}

function hoods(objects) {
  return [...new Set(objects.map(object => object.hood))];
}
