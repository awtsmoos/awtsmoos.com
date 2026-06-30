// B"H
import { createAwtsmoosEngine } from './engine/engine.js';
import { objectBudget, pressureFor, streamRadius } from './save.js';

export const WORLDS = [
  ['Assiyah', 42, 1.0, 1.0],
  ['Yetzirah', 188, 1.38, 1.08],
  ['Beriah', 265, 1.86, 1.16],
  ['Atzilus', 310, 2.48, 1.25]
];

/** Build one world of the ascent with a visible target and real pressure. */
export function createLevel(save, worldIndex = 0) {
  const engine = createAwtsmoosEngine();
  const world = WORLDS[worldIndex % WORLDS.length];
  const pressure = pressureFor(save.perf) * world[3];
  const streamer = engine.streamer(worldIndex, objectBudget(save.perf), streamRadius(save.perf));
  const objects = streamer.update(0, 0);
  return {
    name: world[0],
    worldIndex,
    target: Math.round(8600 * world[2] * pressure),
    time: Math.round(104 / pressure),
    bounds: 6000,
    clock: pressure,
    objects,
    streamer,
    neighborhoods: hoods(objects),
    hue: world[1],
    engine: 'AwtsmoosEngine-0.5-extreme-split'
  };
}

/** Refresh streamed chunks around the living player. */
export function updateLevelStream(level, x, y) {
  level.objects = level.streamer.update(x, y);
  level.neighborhoods = hoods(level.objects);
  return level.objects;
}

function hoods(objects) {
  return [...new Set(objects.map(object => object.hood))];
}
