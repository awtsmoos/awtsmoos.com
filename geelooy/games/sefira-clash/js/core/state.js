import { createFighter } from '../fighters/createFighter.js';
import { applyHatStats } from '../fighters/applyHatStats.js';
import { createMapPowerups } from '../powerups/powerupFactory.js';
import { createMapWeapons } from '../weapons/weaponFactory.js';
import { createStageDirector } from '../stage/events/stageDirector.js';
import { createStageMood } from '../stage/events/stageMood.js';

/**
 * B"H
 * Creates the match state with living-stage vessels.
 *
 * Chapter 145: the arena now opens with fighters, weapons, old powerups, and a
 * hidden stage-soul: mood, director, hazards, scars, and objectives waiting to
 * awaken only when the battle asks for them.
 */
export function createGameState(map, botCount = 5, character = {}, cosmetic = {}) {
  const firstSpawn = map.spawns[0];
  const seed = character.seed || 'sefira-fighter';
  const player = applyHatStats(createFighter(seed, firstSpawn.x, firstSpawn.y, true));
  player.name = 'YOU';
  player.playerTag = 'YOU';
  player.dna.hue = Number(cosmetic.hue || 182);
  player.cosmetic = { headwear: cosmetic.headwear || 'kippah', hue: player.dna.hue };
  applyHatStats(player);
  const fighters = [player];

  for (let i = 0; i < botCount; i++) {
    const spawn = map.spawns[(i + 1) % map.spawns.length];
    const bot = createFighter(`ai-${map.id}-${i}`, spawn.x + i * 34, spawn.y, false);
    bot.name = `Bot ${i + 1}`;
    fighters.push(bot);
  }

  return {
    phase: 'countdown', map, fighters,
    weapons: createMapWeapons(map), powerups: createMapPowerups(map),
    hazards: [], scars: [], objective: null,
    stageMood: createStageMood(map), stageDirector: createStageDirector(),
    particles: [], events: [], frame: 0, winner: '', victoryShown: false,
    camera: { x: 0, y: 0, zoom: 1 }, debug: false
  };
}
