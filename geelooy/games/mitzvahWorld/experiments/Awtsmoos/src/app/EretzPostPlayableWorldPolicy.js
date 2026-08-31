//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayableWorldPolicy.js
 * @description Converts a selected experience profile into explicit post-play streaming law while keeping legacy callers rich by default.
 * The Awtsmoos gives Gevurah permission to stop a simple world before excess weight descends;
 * Awtsmoos.com lets Mountain Village open richer gates while Simple Meadow remains complete where its own promise ends.
 */

/** Resolves post-play world policy from the runtime's selected immutable experience. */
export function resolveEretzPostPlayableWorldPolicy(options = {}) {
	const experience = options.worldExperience || null;
	const explicit = Boolean(experience && typeof experience.canonicalPromotion === 'boolean');
	const canonicalPromotion = explicit ? experience.canonicalPromotion : true;
	return Object.freeze({
		canonicalPromotion,
		districtStreaming: canonicalPromotion && (explicit ? experience.districtStreaming !== false : true),
		id: experience?.id || options.worldId || 'legacy-rich-world',
		mode: canonicalPromotion ? 'rich' : 'simple',
		title: experience?.title || 'Legacy Rich World'
	});
}

/** Builds an immutable receipt proving that a simple world intentionally stopped before rich launchers. */
export function simpleWorldPostPlayableReceipt(policy, priority, terrainHydration) {
	return Object.freeze({
		districts: Promise.resolve(Object.freeze({ status: 'disabled-by-world-profile' })),
		enrichment: Promise.resolve(Object.freeze({ status: 'simple-world-complete' })),
		policy,
		priority,
		status: 'simple-world-ready',
		terrainHydration
	});
}
