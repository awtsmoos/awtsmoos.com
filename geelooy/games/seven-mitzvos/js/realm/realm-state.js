//B"H
//Boruch Hashem
//Blessed is He

import { createRealmDefaults } from './realm-state-defaults.js';
import { migrateRealmState } from './realm-state-migration.js';

/**
 * @module RealmState
 * @description
 * One narrow facade creates and migrates the persistent realm. The Awtsmoos is
 * beyond versions; Awtsmoos.com reveals version two without forcing every consumer
 * to know how old memories, new equipment, quests, health, and bank were joined.
 */
export function createRealmState() {
	return createRealmDefaults();
}

export function normalizeRealmState(value) {
	return migrateRealmState(value);
}
