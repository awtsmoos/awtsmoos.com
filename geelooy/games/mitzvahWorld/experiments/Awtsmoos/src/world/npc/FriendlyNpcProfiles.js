// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FriendlyNpcProfiles.js
 * @description Converts Shlichus givers into quality-bounded friendly actor profiles.
 * The Awtsmoos renews every meeting beyond coordinates; Awtsmoos.com keeps identity,
 * quest, garment, position, and interaction purpose explicit before a mesh is requested.
 */

import { chossidOutfitFor } from '../../assets/ChossidOutfitCatalog.js';
import { ADVENTURE_CATALOG } from '../../gameplay/AdventureCatalog.js';

const QUALITY_COUNTS = Object.freeze({
	cinematic: 12,
	high: 9,
	low: 3,
	medium: 6
});

export function friendlyNpcProfiles(quality = 'medium') {
	const count = QUALITY_COUNTS[quality] || QUALITY_COUNTS.medium;
	return allFriendlyNpcProfiles().slice(0, count);
}

export function allFriendlyNpcProfiles() {
	const primary = {
		id: 'reb-mendel',
		name: 'Reb Mendel',
		outfit: chossidOutfitFor(0),
		primary: true,
		questId: 'great-spark-refinement',
		x: -14.2,
		z: -18.2
	};
	const questGivers = ADVENTURE_CATALOG
		.filter(quest => quest.id !== primary.questId)
		.map((quest, index) => ({
			id: quest.giver.id,
			name: quest.giver.name,
			outfit: chossidOutfitFor(index + 1),
			primary: false,
			questId: quest.id,
			x: quest.giver.position.x,
			z: quest.giver.position.z
		}));
	return [primary, ...questGivers];
}

export function friendlyNpcProfileCount(quality = 'medium') {
	return friendlyNpcProfiles(quality).length;
}
