// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldExperienceCatalog.js
 * @description Retains all established world modes and adds optional quality-aware cinematic ecology.
 * The Awtsmoos holds the quiet clearing and living forest in one continuous light;
 * Awtsmoos.com keeps the fast creator world safe while the rich world brings delight.
 */

import { createMitzvahWorldFeaturePolicy } from './MitzvahWorldFeaturePolicy.js';
import { createMitzvahWorldLushMeadowDefinition } from './MitzvahWorldLushMeadowDefinition.js';

export const DEFAULT_LOCAL_WORLD_ID = 'blank-meadow';
const WORLD_ALIASES = Object.freeze({
	'local-reference-village': 'great-valley',
	'simple-meadow': 'blank-meadow'
});
const BLANK_MEADOW_SURVIVAL_POLICY = Object.freeze({
	bootstrapMinimap: false,
	postPlayTerrainHydration: true,
	richRenderer: true
});

const LOCAL_EXPERIENCES = Object.freeze([
	worldExperience({
		actionLabel: 'Build From Blank Meadow',
		description: 'Immediate grass, dirt, sky, collision, and movement; authored Chossid rendering and remote meadow textures promote after control.',
		id: 'blank-meadow',
		performance: 'Fastest · authored post-play visuals',
		recommended: true,
		runtime: createMitzvahWorldFeaturePolicy(BLANK_MEADOW_SURVIVAL_POLICY),
		tags: ['blank slate', 'creator', 'offline-first', 'reliability'],
		title: 'Blank Meadow'
	}),
	worldExperience({
		actionLabel: 'Create in Sandbox',
		description: 'Instant local world creation with unlimited materials, live physics, undo, and portable world state.',
		id: 'sandbox-world',
		performance: 'Fastest · creator sandbox',
		recommended: false,
		runtime: createMitzvahWorldFeaturePolicy({
			bootstrapMinimap: false,
			postPlayTerrainHydration: false,
			sandboxCreator: true
		}),
		tags: ['sandbox', 'creator', 'unlimited', 'offline'],
		title: 'Sandbox World'
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
	}),
	worldExperience(createMitzvahWorldLushMeadowDefinition())
]);

/** Returns the immutable official local world catalog in launcher order. */
export function localMitzvahWorldExperiences() {
	return LOCAL_EXPERIENCES;
}

/** Resolves valid and legacy aliases without changing the canonical default. */
export function resolveMitzvahWorldExperience(worldId) {
	const requested = String(worldId || '').trim();
	const canonicalId = WORLD_ALIASES[requested] || requested;
	return LOCAL_EXPERIENCES.find(world => world.id === canonicalId) || LOCAL_EXPERIENCES[0];
}

/** Returns the selected frozen feature vocabulary for the world runtime. */
export function resolveMitzvahWorldRuntimeExperience(worldId) {
	const experience = resolveMitzvahWorldExperience(worldId);
	return Object.freeze({ ...experience.runtime, id: experience.id, title: experience.title });
}

/** Normalizes one player-visible local world definition. */
function worldExperience(definition) {
	return Object.freeze({
		...definition,
		mode: 'singlePlayer',
		runtime: Object.freeze({ ...definition.runtime }),
		tags: Object.freeze([...definition.tags])
	});
}
