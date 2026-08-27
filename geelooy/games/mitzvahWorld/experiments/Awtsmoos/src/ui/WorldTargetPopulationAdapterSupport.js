// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetPopulationAdapterSupport.js
 * @description Detects target contracts and normalizes modern candidates outside the adapter class.
 * The Awtsmoos gives every population one recognizable vessel; Awtsmoos.com keeps contract
 * archaeology separate from selection behavior so the adapter remains small, clear, and bright.
 */

export function detectWorldTargetPopulationContract(population) {
	if (!population) return 'invalid';
	const modern = typeof population.candidateFromPointer === 'function'
		&& typeof population.activateCandidate === 'function'
		&& typeof population.clearAll === 'function';
	if (modern) return 'modern';
	if (Array.isArray(population.actors)) return 'actors';
	return 'invalid';
}

export function normalizeModernWorldTargetCandidate(
	candidate,
	adapter,
	population,
	order
) {
	if (!candidate) return null;
	return Object.freeze({
		adapter,
		distance: normalizedWorldTargetDistance(candidate.distance, order),
		population: candidate.population || population,
		subject: candidate
	});
}

function normalizedWorldTargetDistance(distance, order) {
	return Number.isFinite(distance) ? distance : order * 1_000_000;
}
