import { createFighter } from '../fighters/createFighter.js';
import { applyHatStats } from '../fighters/applyHatStats.js';
import { createAdventureRun } from '../adventure/adventureRun.js';
import { createMapPowerups } from '../powerups/powerupFactory.js';
import { createMapWeapons } from '../weapons/weaponFactory.js';
import { createStageDirector } from '../stage/events/stageDirector.js';
import { createStageMood } from '../stage/events/stageMood.js';
import { createCombatDiagnostics } from '../combat/comboSystem.js';
import { applyPersonality } from '../ai/advanced/personality/applyPersonality.js';

/**
 * B"H
 * Creates the match state with diagnostics, AI souls, and Adventure run truth.
 *
 * Before the first punch, the Awtsmoos arranges vessels: player, bots, sparks,
 * weapons, stage mood, and now a real gate ledger for platform Adventure.
 */
export function createGameState(map, botCount = 5, character = {}, cosmetic = {}) {
  const fighters = [createPlayer(map, character, cosmetic)];
  for (let i = 0; i < botCount; i++) fighters.push(createBot(map, i));
  return {
    phase: 'countdown', map, fighters,
    weapons: createMapWeapons(map), powerups: createMapPowerups(map),
    hazards: [], scars: [], objective: null, adventureRun: createAdventureRun(map),
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
  bot.name = map.rules?.adventure ? `Kelipah ${index + 1}` : `Bot ${index + 1}`;
  applyPersonality(bot, index);
  return bot;
}
