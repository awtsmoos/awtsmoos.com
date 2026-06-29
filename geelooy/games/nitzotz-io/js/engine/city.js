// B"H
import { chunkCenter, hashKey } from './chunks.js';
import { chooseKind } from './cityKinds.js';
import { hoodFor } from './neighborhoods.js';
import { placeObject } from './placement.js';
import { rng, TAU } from '../math.js';

/** B"H: The city is procedurally alive, but each chunk now leaves breathing room. */
export function createCity(seed, worldIndex, budget) {
  const keys = ['0,0', '-1,0', '1,0', '0,-1', '0,1'];
  const out = [];
  let id = 0;
  for (const key of keys) out.push(...chunkObjects(key, seed, worldIndex, budget, () => id++));
  return out;
}

export function createChunk(seed, worldIndex, key, budget, nextId) {
  return chunkObjects(key, seed, worldIndex, budget, nextId);
}

function chunkObjects(key, seed, worldIndex, budget, nextId) {
  const rand = rng(hashKey(key, seed + worldIndex * 101));
  const center = chunkCenter(key);
  const hood = hoodFor(key);
  const out = [];
  for (let i = 0; i < budget; i += 1) {
    const place = placeObject(center, i, budget, rand);
    out.push({ id: nextId(), chunk: key, hood: hood.name, kind: chooseKind(hood, rand, i), x: place.x, y: place.y, rot: rand() * TAU });
  }
  return out;
}
