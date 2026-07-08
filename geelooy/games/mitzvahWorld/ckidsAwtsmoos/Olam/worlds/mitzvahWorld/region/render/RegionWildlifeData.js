// B"H
/**
 * @file RegionWildlifeData.js
 * @description Wildlife counts and numeric laws for fast first playable load.
 */
import { rand } from "./RegionRandom.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export const COUNTS = Object.freeze({ rabbit:18, fox:6, deer:8, goat:6, cow:5, frog:12, bird:10 });
export const TOTAL_PLAYABLE_WILDLIFE_LIMIT = 76;
export const FIRST_PLAYABLE_WILDLIFE_LIMIT = 2;
export const STREAMED_WILDLIFE_CHUNK = 3;
export const FLAGS = Object.freeze({
  wildlifeActor:true,
  realisticWildlife:true,
  selectableCombatTarget:true,
  skipRaycast:false,
  interactionLayer:"explicit-interaction",
  singleMeshAnimal:true
});
export const FAST = new Set(["hunt", "attack", "flee", "fleePlayer", "flock", "swoop", "panic", "pounce", "run", "return_home"]);
export const SIZE = Object.freeze({
  frog:[2.1,1.35,2.1],
  bird:[2.6,2.35,2.6],
  cow:[2.8,2.2,3.2],
  deer:[2.2,2.15,2.5],
  goat:[1.8,1.75,1.9],
  fox:[1.9,1.55,2],
  rabbit:[1.65,1.35,1.65]
});
export const TINT = Object.freeze({
  fox:0xb65a28,
  rabbit:0xbba995,
  deer:0xa56b3a,
  goat:0xd4c7aa,
  cow:0x7b5a42,
  frog:0x4e9b45,
  bird:0x5f7fb2
});

export function distance2(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

export function length2d(x, z) {
  return Math.sqrt(x * x + z * z);
}

export function safe(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

export function playerMesh(olam) {
  const player = olam && (olam.player || olam.chossid);
  return player?.mesh || null;
}

export function radius(animal) {
  return animal.territory?.radius ? Math.min(42, animal.territory.radius) : animal.species === "cow" ? 18 : 24;
}

export function speed(animal, root) {
  return animal.traits?.speed || root.userData.profile?.speed || 0.8;
}

export function countMeshes(root) {
  let count = 0;
  root?.traverse?.(child => {
    if (child.isMesh || child.isSkinnedMesh) count++;
  });
  return count;
}

function reportAnimals(report) {
  const wildlife = report?.wildlife;
  return wildlife && Array.isArray(wildlife.animals) && wildlife.animals.length ? wildlife.animals : null;
}

function fallbackAnimals() {
  const out = [];
  for (const species of Object.keys(COUNTS)) {
    for (let i = 0; i < COUNTS[species]; i++) {
      out.push({
        id:`${species}_${i}`,
        species,
        x:(rand(i, 1) - 0.5) * 320 + (species === "cow" ? 24 : 0),
        z:(rand(i, 2) - 0.5) * 160 + (species === "cow" ? 18 : 0),
        state:"wander",
        needs:{}
      });
    }
  }
  return out;
}

/**
 * B"H
 * Returns every animal allowed to stream into the living region.
 *
 * @param {object} report Region report.
 * @returns {Array<object>} Bounded animal definitions.
 */
export function allAnimalsFromReport(report) {
  return (reportAnimals(report) || fallbackAnimals()).slice(0, TOTAL_PLAYABLE_WILDLIFE_LIMIT);
}

/**
 * B"H
 * Returns only the first proof herd needed before the loader releases.
 *
 * @param {object} report Region report.
 * @returns {Array<object>} First playable animal definitions.
 */
export function animalsFromReport(report) {
  return allAnimalsFromReport(report).slice(0, FIRST_PLAYABLE_WILDLIFE_LIMIT);
}

export function boxData(size = [1, 1, 1]) {
  const x = size[0] / 2;
  const y = size[1] / 2;
  const z = size[2] / 2;
  return {
    positions:[-x,-y,-z,x,-y,-z,x,y,-z,-x,y,-z,-x,-y,z,x,-y,z,x,y,z,-x,y,z],
    indices:[0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0]
  };
}

export function clearSpawn(olam, x, z, index) {
  const live = playerMesh(olam);
  const sx = live ? live.position.x : -10.8;
  const sz = live ? live.position.z : 16.2;
  const dx = x - sx;
  const dz = z - sz;
  if (dx * dx + dz * dz >= 576) return { x, z };
  const angle = dx * dx + dz * dz > 0.01 ? Math.atan2(dz, dx) : rand(index, 73) * Math.PI * 2;
  return { x:sx + Math.cos(angle) * (27 + rand(index, 74) * 9), z:sz + Math.sin(angle) * (27 + rand(index, 74) * 9) };
}

export function guardianWildlifeCadence() {
  return Number(globalThis.__AWTSMOOS_FPS_GUARDIAN__?.config?.wildlifeTickSec) || 0.11;
}
