// B"H
/** Builds quality-bounded friendly profiles with canonical village-life metadata. */

import { chossidOutfitFor } from '../../assets/ChossidOutfitCatalog.js';
import { ADVENTURE_CATALOG } from '../../gameplay/AdventureCatalog.js';
import { friendlyNpcLifeMetadata } from './FriendlyNpcLifeCatalog.js';

const PRIMARY_QUEST_ID = 'great-spark-refinement';
const QUALITY_COUNTS = Object.freeze({ cinematic: 12, high: 7, low: 3, medium: 4 });
const ALL_PROFILES = Object.freeze(buildFriendlyNpcProfiles());

/** Returns a stable, quality-bounded set of village inhabitants. */
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
	const primaryQuest = ADVENTURE_CATALOG.find(quest => quest.id === PRIMARY_QUEST_ID);
	const primary = createProfile(primaryQuest, 0, {
		id: 'reb-mendel',
		name: 'Reb Mendel',
		primary: true,
		x: -8.2,
		z: 43.5
	});
	const questGivers = ADVENTURE_CATALOG
		.filter(quest => quest.id !== PRIMARY_QUEST_ID)
		.map((quest, index) => createProfile(quest, index + 1));
	return [primary, ...questGivers];
}

function createProfile(quest, index, overrides = {}) {
	const x = overrides.x ?? quest.giver.position.x;
	const z = overrides.z ?? quest.giver.position.z;
	const lifeQuest = withWorkPosition(quest, x, z);
	return Object.freeze({
		...friendlyNpcLifeMetadata(lifeQuest, index, overrides.name || quest.giver.name),
		id: overrides.id || quest.giver.id,
		interactionRadius: 4.5,
		motionPhase: index === 0 ? 0.7 : (index - 1) * 1.37,
		motionSpeed: index === 0 ? 0.18 : 0.20 + (index - 1) % 3 * 0.035,
		name: overrides.name || quest.giver.name,
		outfit: chossidOutfitFor(index),
		primary: Boolean(overrides.primary),
		questId: quest.id,
		walkSpeed: 1.1 + index % 3 * 0.12,
		wanderRadius: index === 0 ? 1.45 : 1.7 + (index - 1) % 4 * 0.55,
		x,
		z
	});
}

function withWorkPosition(quest, x, z) {
	if (x === quest.giver.position.x && z === quest.giver.position.z) return quest;
	return { ...quest, giver: { ...quest.giver, position: { x, y: 0, z } } };
}
