// B"H
import { createAwtsmoosEngine } from './engine/engine.js';
import { objectBudget, streamRadius } from './save.js';

export const WORLDS = [['Assiyah', 42, 1], ['Yetzirah', 188, 1.22], ['Beriah', 265, 1.48], ['Atzilus', 310, 1.8]];

/** B"H: A level now starts as a readable field, not a flood. */
export function createLevel(save, worldIndex = 0) {
  const awts = createAwtsmoosEngine();
  const world = WORLDS[worldIndex % WORLDS.length];
  const streamer = awts.streamer(worldIndex, objectBudget(save.perf), streamRadius(save.perf));
  const objects = streamer.update(0, 0);
  return { name: world[0], worldIndex, target: Math.round(4200 * world[2]), time: 125, bounds: 6000, objects, streamer, neighborhoods: hoods(objects), hue: world[1], engine: 'AwtsmoosEngine-0.3-clear-camera' };
}

export function updateLevelStream(level, x, y) {
  level.objects = level.streamer.update(x, y);
  level.neighborhoods = hoods(level.objects);
  return level.objects;
}

function hoods(objects) {
  return [...new Set(objects.map(object => object.hood))];
}
