// B"H
import { chunkKey, nearbyChunks } from './chunks.js';
import { tier } from './tier.js';

/** B"H: Streaming now gives neighborhoods, not a crowd crushing the camera. */
export function createStreamer(engine, worldIndex, budget, radius = 1) {
  let next = 1;
  let last = '';
  let active = [];
  let visible = [];
  const cache = new Map();
  function ensure(key) {
    if (!cache.has(key)) {
      const raw = engine.chunk(worldIndex, key, budget, () => next++);
      cache.set(key, raw.map(object => engine.object(object, tier(object.kind, worldIndex), worldIndex)));
    }
    return cache.get(key);
  }
  function update(x, y) {
    const center = chunkKey(x, y);
    if (center === last && visible.length) return visible;
    last = center;
    active = nearbyChunks(x, y, radius);
    visible = active.flatMap(ensure);
    return visible;
  }
  return { update, get visible() { return visible; }, get active() { return active; }, get cached() { return cache.size; } };
}
