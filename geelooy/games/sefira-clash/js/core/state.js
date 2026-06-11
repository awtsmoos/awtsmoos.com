import { createFighter } from '../fighters/createFighter.js';
import { createMapPowerups } from '../powerups/powerupFactory.js';
import { createMapWeapons } from '../weapons/weaponFactory.js';

/**
 * B"H
 * Creates the match state: one known human, many wandering sparks.
 *
 * Chapter 18: the arena is no longer only bodies and blades. The Awtsmoos
 * seeds it with orbs of changed law, so the fighters race toward choice: heal,
 * leap again, strike harder, move faster, or glow behind a shield of light.
 *
 * @param {object} map Selected map data.
 * @param {number} botCount Amount of AI fighters.
 * @param {object} character Selected character data.
 * @returns {object} Mutable game state for the loop and renderer.
 */
export function createGameState(map, botCount = 5, character = {}) {
  const firstSpawn = map.spawns[0];
  const playerSeed = character.seed || 'adam-player';
  const fighters = [createFighter(playerSeed, firstSpawn.x, firstSpawn.y, true)];
  fighters[0].name = character.name || 'YOU';
  fighters[0].playerTag = 'YOU';

  for (let i = 0; i < botCount; i++) {
    const spawn = map.spawns[(i + 1) % map.spawns.length];
    const bot = createFighter(`ai-${map.id}-${i}`, spawn.x + i * 34, spawn.y, false);
    bot.name = `Bot ${i + 1}`;
    fighters.push(bot);
  }

  return {
    phase: 'countdown', map, fighters,
    weapons: createMapWeapons(map), powerups: createMapPowerups(map),
    particles: [], events: [], frame: 0, winner: '',
    camera: { x: 0, y: 0, zoom: 1 }, debug: false
  };
}
