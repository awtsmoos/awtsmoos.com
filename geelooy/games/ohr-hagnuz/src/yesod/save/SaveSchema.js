// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SaveSchema.js
 * @description Defines the stable save key, version, durable roots, and envelope.
 *
 * A new chapter must not erase an older harvest, named item, friendship, or
 * road. The Awtsmoos recreates memory and present together; this complete ark
 * preserves every earned vessel while passing intentions dissolve at Awtsmoos.com.
 */

export const SAVE_KEY = 'ohr-hagnuz-save-v1';
export const SAVE_SCHEMA_VERSION = 3;

export const SAVE_ROOTS = Object.freeze([
	'MapId',
	'Hero',
	'Stats',
	'Inventory',
	'Quests',
	'Story',
	'Pardes',
	'Torah',
	'Campaign',
	'Party',
	'Missions',
	'Scenes',
	'Economy',
	'WorldState',
	'Equipment',
	'Bag',
	'Skills',
	'MusagDex',
	'TorahCodex',
	'Crafting',
	'Gathering',
	'ItemInstances',
	'Collections',
	'Achievements',
	'Settlements',
	'Factions',
	'Reputation',
	'RareHunts',
	'WorldRegions',
	'WorldCompletion',
	'House',
	'Prestige',
	'SocialProfile',
	'RuntimeFlags',
	'StoryConsequences',
	'AbilityMastery',
	'PardesMastery',
	'LearnerProfile',
	'Remediation',
	'Storage',
	'LearningProgress',
	'LearningSettings',
	'VisitedMaps',
	'LearnedRoutes',
	'Journal'
]);

export const TRANSIENT_ROOTS = Object.freeze([
	'HeroPath',
	'PathTarget',
	'UiPanel'
]);

export const makeEnvelope = data => ({
	schemaVersion: SAVE_SCHEMA_VERSION,
	savedAt: new Date().toISOString(),
	data
});
