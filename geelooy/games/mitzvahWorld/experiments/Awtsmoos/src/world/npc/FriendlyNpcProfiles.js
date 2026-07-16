// B"H
/** Converts Shlichus givers into quality-bounded, independently animated chossid.glb profiles. */
import { chossidOutfitFor } from '../../assets/ChossidOutfitCatalog.js';
import { ADVENTURE_CATALOG } from '../../gameplay/AdventureCatalog.js';

const QUALITY_COUNTS = Object.freeze({ cinematic: 12, high: 7, low: 3, medium: 4 });

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
		motionPhase: 0.7,
		motionSpeed: 0.18,
		wanderRadius: 1.45,
		x: -8.2,
		z: 43.5
	};
	const questGivers = ADVENTURE_CATALOG
		.filter(quest => quest.id !== primary.questId)
		.map((quest, index) => ({
			id: quest.giver.id,
			name: quest.giver.name,
			outfit: chossidOutfitFor(index + 1),
			primary: false,
			questId: quest.id,
			motionPhase: index * 1.37,
			motionSpeed: 0.20 + index % 3 * 0.035,
			wanderRadius: 1.7 + index % 4 * 0.55,
			x: quest.giver.position.x,
			z: quest.giver.position.z
		}));
	return [primary, ...questGivers];
}

export function friendlyNpcProfileCount(quality = 'medium') {
	return friendlyNpcProfiles(quality).length;
}
