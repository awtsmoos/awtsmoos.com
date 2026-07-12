/**
 * B"H
 * @module SaveSchema
 * @description Versioned persistence roots for the unified campaign state.
 */
export const SAVE_KEY = 'ohr-hagnuz:save:v1';
export const SAVE_SCHEMA_VERSION = 2;

export const SAVE_ROOTS = [
	'ActiveRealm', 'MapId', 'Hero', 'Stats', 'Sefiros', 'Equipment', 'Inventory',
	'Storage', 'ItemInstances', 'Achievements', 'Gathering', 'Crafting',
	'Reputation', 'RareHunts', 'WorldCompletion', 'Prestige', 'SocialProfile',
	'Story', 'Gifts', 'Skills', 'TorahKnowledge', 'TorahCodex', 'LearnedRoutes',
	'MusagDex', 'Quests', 'VisitedMaps', 'Dialogue', 'Merchant', 'Campaign',
	'Party', 'Missions', 'Scenes', 'Economy', 'WorldState'
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
