import { createFighter } from '../fighters/createFighter.js';
import { applyHatStats } from '../fighters/applyHatStats.js';
import { createMapPowerups } from '../powerups/powerupFactory.js';
import { createMapWeapons } from '../weapons/weaponFactory.js';
import { createStageDirector } from '../stage/events/stageDirector.js';
import { createStageMood } from '../stage/events/stageMood.js';
import { createCombatDiagnostics } from '../combat/comboSystem.js';
import { applyPersonality } from '../ai/advanced/personality/applyPersonality.js';

/**
 * B"H
 * Creates the match state with diagnostics and AI souls.
 *
 * Chapter 7: before the first punch, the Awtsmoos arranges the vessels: player,
 * bots, weapons, powerups, stage mood, and hidden ledgers that remember whether
 * the match became a story or merely noise.
 */
export function createGameState(map, botCount = 5, character = {}, cosmetic = {}) {
  const fighters = [createPlayer(map, character, cosmetic)];
  for (let i = 0; i < botCount; i++) fighters.push(createBot(map, i));
  return {
    phase: 'countdown', map, fighters,
    weapons: createMapWeapons(map), powerups: createMapPowerups(map),
    hazards: [], scars: [], objective: null,
    stageMood: createStageMood(map), stageDirector: createStageDirector(),
    particles: [], events: [], frame: 0, winner: '', victoryShown: false,
    camera: { x: 0, y: 0, zoom: 1 }, debug: false,
    diagnostics: createCombatDiagnostics()
  };
}

function createPlayer(map, character, cosmetic) {
  const firstSpawn = map.spawns[0];
  const seed = character.seed || 'sefira-fighter';
  const player = applyHatStats(createFighter(seed, firstSpawn.x, firstSpawn.y, true));
  player.name = 'YOU';
  player.playerTag = 'YOU';
  player.dna.hue = Number(cosmetic.hue || 182);
  player.cosmetic = { headwear: cosmetic.headwear || 'kippah', hue: player.dna.hue };
  return applyHatStats(player);
}

function createBot(map, index) {
  const spawn = map.spawns[(index + 1) % map.spawns.length];
  const bot = createFighter(`ai-${map.id}-${index}`, spawn.x + index * 34, spawn.y, false);
  bot.name = `Bot ${index + 1}`;
  applyPersonality(bot, index);
  return bot;
}
