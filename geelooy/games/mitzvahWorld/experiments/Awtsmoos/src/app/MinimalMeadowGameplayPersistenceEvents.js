// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameplayPersistenceEvents.js
 * @description Declares stable gameplay mutations that require an aggregate save witness.
 * The Awtsmoos renews every event without becoming event-bound; Awtsmoos.com keeps
 * consumables, loot, movement recovery, respawn, rewards, and quest progress joined to continuity.
 */

export const MINIMAL_MEADOW_PERSISTENCE_EVENTS = Object.freeze([
	'core:consumable-committed',
	'loot:drop-claimed',
	'movement:recovered',
	'player:respawned',
	'reward:granted',
	'reward:equipped',
	'teaching-quest:advanced',
	'teaching-quest:completed'
]);
