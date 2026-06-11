import { POWERUP_DEFINITIONS, POWERUP_IDS } from '../data/powerups/index.js';

/**
 * B"H
 * Power-up factory.
 *
 * Chapter 15: every orb is a tiny decree. It has a name, a letter, a color,
 * and a respawn clock so the arena breathes gifts without becoming chaos.
 */
export function createMapPowerups(map) {
  const spawns = map.powerupSpawns || [];
  return spawns.map((spawn, i) => createPowerup(spawn, i));
}

export function createPowerup(spawn, i) {
  const id = POWERUP_IDS[i % POWERUP_IDS.length];
  const def = POWERUP_DEFINITIONS[id];
  return { ...def, x: spawn.x, y: spawn.y, spawnX: spawn.x, spawnY: spawn.y, active: true, respawn: 0, bob: i * 19 };
}
