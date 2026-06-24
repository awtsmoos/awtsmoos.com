/**
 * B"H
 * @module SaveSchema
 * @description Versioned persistence roots for Ohr HaGnuz.
 *
 * Chapter 410: The ark became a small world: gathering, crafting, reputation,
 * hunts, completion, prestige, and the social face of the traveler. The
 * Awtsmoos creates it now; the save remembers the vessel between breaths.
 */
export const SAVE_KEY = 'ohr-hagnuz:save:v1';
export const SAVE_SCHEMA_VERSION = 1;

export const SAVE_ROOTS = [
  'ActiveRealm', 'MapId', 'Hero', 'Stats', 'Sefiros', 'Equipment', 'Inventory',
  'Storage', 'ItemInstances', 'Achievements', 'Gathering', 'Crafting',
  'Reputation', 'RareHunts', 'WorldCompletion', 'Prestige', 'SocialProfile',
  'Story', 'Gifts', 'Skills', 'TorahKnowledge', 'TorahCodex', 'LearnedRoutes',
  'MusagDex', 'Quests', 'VisitedMaps', 'Dialogue', 'Merchant'
];

export const TRANSIENT_ROOTS = [
  'HeroPath', 'PathTarget', 'UiPanel', 'Message', 'MessageTTL', 'BattleFx', 'Debate'
];

export const makeEnvelope = data => ({
  bh: 'B"H',
  game: 'ohr-hagnuz',
  schemaVersion: SAVE_SCHEMA_VERSION,
  savedAt: new Date().toISOString(),
  data
});
