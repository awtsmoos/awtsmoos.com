//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldExperienceCatalog.js
 * @description Names fast meadow, creator sandbox, and richer mountain-village experiences with explicit runtime laws.
 * The Awtsmoos reveals many worlds without confusing their garments or their load;
 * Awtsmoos.com lets instant creation reuse the proven meadow threshold while richer civilization streams only when requested.
 */

export const DEFAULT_LOCAL_WORLD_ID = 'simple-meadow';

const LOCAL_EXPERIENCES = Object.freeze([
	worldExperience({
		actionLabel: 'Enter Simple Meadow',
		description: 'Fast local play with textured ground, responsive movement, and no heavy village streaming.',
		id: 'simple-meadow',
		performance: 'Fast · mobile friendly',
		recommended: true,
		runtime: {
			canonicalPromotion: false,
			deepWorldStreaming: false,
			districtStreaming: false,
			postPlayPresentation: false,
			richRenderer: true
		},
		tags: ['recommended', 'textured terrain', 'offline'],
		title: 'Simple Meadow'
	}),
	worldExperience({
		actionLabel: 'Create in Sandbox',
		description: 'Instant local world creation with unlimited materials, live physics, undo, and portable world state.',
		id: 'sandbox-world',
		performance: 'Fast · creator mode',
		recommended: false,
		runtime: {
			canonicalPromotion: false,
			deepWorldStreaming: false,
			districtStreaming: false,
			postPlayPresentation: false,
			richRenderer: true,
			sandboxCreator: true
		},
		tags: ['sandbox', 'creator', 'unlimited', 'offline'],
		title: 'Sandbox World'
	}),
	worldExperience({
		actionLabel: 'Explore Mountain Village',
		description: 'A richer local world that promotes into canonical terrain, village systems, and streamed detail.',
		id: 'local-reference-village',
		performance: 'Rich · streams after play',
		recommended: false,
		runtime: {
			canonicalPromotion: true,
			deepWorldStreaming: true,
			districtStreaming: true,
			postPlayPresentation: true,
			richRenderer: true
		},
		tags: ['richer world', 'village', 'offline'],
		title: 'Mountain Village'
	})
]);

/** Returns the immutable ordered local experience catalog used by the launcher. */
export function localMitzvahWorldExperiences() {
	return LOCAL_EXPERIENCES;
}

/** Resolves an authored local ID, falling back to the guaranteed Simple Meadow vessel. */
export function resolveMitzvahWorldExperience(worldId) {
	const requested = String(worldId || '').trim();
	return LOCAL_EXPERIENCES.find(world => world.id === requested)
		|| LOCAL_EXPERIENCES[0];
}

/** Returns the compact immutable runtime policy for one selected local experience. */
export function resolveMitzvahWorldRuntimeExperience(worldId) {
	const experience = resolveMitzvahWorldExperience(worldId);
	return Object.freeze({
		...experience.runtime,
		id: experience.id,
		title: experience.title
	});
}

/** Freezes one player-visible experience and its runtime policy at the catalog boundary. */
function worldExperience(definition) {
	return Object.freeze({
		...definition,
		mode: 'singlePlayer',
		runtime: Object.freeze({ ...definition.runtime }),
		tags: Object.freeze([...definition.tags])
	});
}
