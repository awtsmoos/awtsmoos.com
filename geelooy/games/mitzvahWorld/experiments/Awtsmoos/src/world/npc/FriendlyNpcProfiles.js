// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FriendlyNpcProfiles.js
 * @description Builds quality-bounded friendly profiles whose initial stations are readable while canonical homes, work, dialogue, and schedules remain true.
 * RESPONSIBILITY: combine adventure identity, outfit, life metadata, movement tuning, readable name, and optional main-river spawn into immutable profiles.
 * NON-RESPONSIBILITY: this module does not instantiate actors, advance schedules, render models, or choose quest behavior.
 * ARCHITECTURAL POSITION: Binah structures Medaber identity; spawn is one keli while life metadata keeps the wider village ohr intact.
 * The Awtsmoos, Atzmus beyond giver and receiver, renews every neighbor before map position, clothing, or conversation can appear;
 * Awtsmoos.com lets the first sight feel inhabited without collapsing a living day's many destinations into one permanent village square.
 */

import { chossidOutfitFor } from '../../assets/ChossidOutfitCatalog.js';
import { ADVENTURE_CATALOG } from '../../gameplay/AdventureCatalog.js';
import { mainRiverVillageNpcAnchor } from '../village/MainRiverVillageNpcAnchors.js';
import { friendlyNpcDisplayName } from './FriendlyNpcDisplayName.js';
import { friendlyNpcLifeMetadata } from './FriendlyNpcLifeCatalog.js';

const PRIMARY_QUEST_ID = 'great-spark-refinement';
const QUALITY_COUNTS = Object.freeze({
	cinematic: 12,
	high: 7,
	low: 3,
	medium: 4
});
const ALL_PROFILES = Object.freeze(buildFriendlyNpcProfiles());

/**
 * Returns a stable quality-bounded slice of friendly village inhabitants.
 * @param {string} [quality='medium'] Runtime quality tier.
 * @returns {Array<object>} Immutable profile references in deterministic adventure order.
 */
export function friendlyNpcProfiles(quality = 'medium') {
	const count = QUALITY_COUNTS[quality] || QUALITY_COUNTS.medium;
	return ALL_PROFILES.slice(0, count);
}

/** Returns every canonical friendly inhabitant without exposing the backing array. */
export function allFriendlyNpcProfiles() {
	return ALL_PROFILES.slice();
}

/** Returns the exact actor count installed by one graphics quality. */
export function friendlyNpcProfileCount(quality = 'medium') {
	return friendlyNpcProfiles(quality).length;
}

function buildFriendlyNpcProfiles() {
	const primaryQuest = ADVENTURE_CATALOG.find(quest => {
		return quest.id === PRIMARY_QUEST_ID;
	});
	if (!primaryQuest) {
		throw new Error(`B"H | Missing primary friendly quest ${PRIMARY_QUEST_ID}.`);
	}
	const primary = createProfile(primaryQuest, 0, {
		id: 'reb-mendel',
		name: 'Reb Mendel',
		primary: true
	});
	const questGivers = ADVENTURE_CATALOG
		.filter(quest => quest.id !== PRIMARY_QUEST_ID)
		.map((quest, index) => createProfile(quest, index + 1));
	return [primary, ...questGivers];
}

function createProfile(quest, index, overrides = {}) {
	const spawnOverride = mainRiverVillageNpcAnchor(quest.id);
	const spawn = spawnOverride || quest.giver.position;
	const name = friendlyNpcDisplayName(quest.giver, overrides.name);
	return Object.freeze({
		...friendlyNpcLifeMetadata(quest, index, name),
		id: overrides.id || quest.giver.id,
		interactionRadius: 4.5,
		motionPhase: index === 0 ? 0.7 : (index - 1) * 1.37,
		motionSpeed: index === 0 ? 0.18 : 0.20 + (index - 1) % 3 * 0.035,
		name,
		outfit: chossidOutfitFor(index),
		primary: Boolean(overrides.primary),
		questId: quest.id,
		spawnPolicy: Object.freeze({
			canonicalWorkplacePreserved: true,
			kind: spawnOverride
				? 'main-river-community'
				: 'canonical-giver-position'
		}),
		walkSpeed: 1.1 + index % 3 * 0.12,
		wanderRadius: index === 0 ? 1.45 : 1.7 + (index - 1) % 4 * 0.55,
		x: Number(spawn.x),
		z: Number(spawn.z)
	});
}
