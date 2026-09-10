//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldExperienceCatalog.js
 * @description Publishes the official local-world ladder and preserves legacy world IDs as aliases.
 * Blank Meadow is the reliability baseline, Living Village is the civilization baseline,
 * and Great Valley is the regional-streaming baseline; every profile owns an explicit feature policy.
 */

import { createMitzvahWorldFeaturePolicy } from './MitzvahWorldFeaturePolicy.js';

export const DEFAULT_LOCAL_WORLD_ID = 'blank-meadow';

const WORLD_ALIASES = Object.freeze({
	'local-reference-village': 'great-valley',
	'simple-meadow': 'blank-meadow'
});

const LOCAL_EXPERIENCES = Object.freeze([
	worldExperience({
		actionLabel: 'Build From Blank Meadow',
		description: 'Grass, dirt, sky, collision, and immediate movement with rich world systems intentionally disabled.',
		id: 'blank-meadow',
		performance: 'Fastest · offline baseline',
		recommended: true,
		runtime: createMitzvahWorldFeaturePolicy({ bootstrapMinimap: false }),
		tags: ['blank slate', 'creator', 'offline', 'reliability'],
		title: 'Blank Meadow'
	}),
	worldExperience({
		actionLabel: 'Enter Living Village',
		description: 'A focused inhabited village with houses, roads, water, trees, and residents after first control.',
		id: 'living-village',
		performance: 'Standard · streamed after play',
		recommended: false,
		runtime: createMitzvahWorldFeaturePolicy({
			bootstrapCombat: true,
			canonicalPromotion: true,
			cinematicEnvironment: true,
			districtStreaming: true
		}),
		tags: ['village', 'houses', 'npcs', 'river'],
		title: 'Living Village'
	}),
	worldExperience({
		actionLabel: 'Explore Great Valley',
		description: 'The full mountain-valley experience with deep regional streaming and cinematic post-play enrichment.',
		id: 'great-valley',
		performance: 'Rich · regional streaming',
		recommended: false,
		runtime: createMitzvahWorldFeaturePolicy({
			bootstrapCombat: true,
			canonicalPromotion: true,
			cinematicEnvironment: true,
			cinematicHero: true,
			cinematicLandscape: true,
			deepWorldStreaming: true,
			districtStreaming: true
		}),
		tags: ['valley', 'mountains', 'waterfalls', 'streaming'],
		title: 'Great Valley'
	})
]);

/** Returns the ordered official local worlds shown by the launcher. */
export function localMitzvahWorldExperiences() {
	return LOCAL_EXPERIENCES;
}

/** Resolves official and legacy IDs to one current world definition. */
export function resolveMitzvahWorldExperience(worldId) {
	const requested = String(worldId || '').trim();
	const canonicalId = WORLD_ALIASES[requested] || requested;
	return LOCAL_EXPERIENCES.find(world => world.id === canonicalId)
		|| LOCAL_EXPERIENCES[0];
}

/** Returns the compact immutable runtime policy for the selected local experience. */
export function resolveMitzvahWorldRuntimeExperience(worldId) {
	const experience = resolveMitzvahWorldExperience(worldId);
	return Object.freeze({
		...experience.runtime,
		id: experience.id,
		title: experience.title
	});
}

/** Freezes one player-visible experience and its complete runtime contract. */
function worldExperience(definition) {
	return Object.freeze({
		...definition,
		mode: 'singlePlayer',
		runtime: Object.freeze({ ...definition.runtime }),
		tags: Object.freeze([...definition.tags])
	});
}
