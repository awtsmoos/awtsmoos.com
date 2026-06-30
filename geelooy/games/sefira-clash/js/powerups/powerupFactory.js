import { POWERUP_DEFINITIONS, POWERUP_IDS } from '../data/powerups/index.js';

/**
 * B"H
 * Power-up factory with Adventure Sparks.
 *
 * VS arenas still rotate combat blessings. Adventure maps now turn every `O` and
 * `*` marker into a Spark, and hidden markers stay hidden in the run ledger so
 * the campaign remembers secrets instead of pretending they were generic orbs.
 */
export function createMapPowerups(map) {
  const spawns = map.powerupSpawns || [];
  return spawns.map((spawn, i) => createPowerup(spawn, i, map));
}

export function createPowerup(spawn, i, map = null) {
  if (map?.rules?.adventure) return createAdventureSpark(spawn, i);
  const id = POWERUP_IDS[i % POWERUP_IDS.length];
  const def = POWERUP_DEFINITIONS[id];
  return baseOrb(def, spawn, i);
}

function createAdventureSpark(spawn, i) {
  return baseOrb({
    id: 'adventureSpark',
    name: spawn.hiddenSpark ? 'Hidden Spark' : 'Adventure Spark',
    letter: '✦',
    color: spawn.hiddenSpark ? '#d8a8ff' : '#84f7ff',
    duration: 1,
    hiddenSpark: !!spawn.hiddenSpark
  }, spawn, i);
}

function baseOrb(def, spawn, i) {
  return { ...def, x: spawn.x, y: spawn.y, spawnX: spawn.x, spawnY: spawn.y, active: true, respawn: 0, bob: i * 19 };
}
