// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceTakeEvidence.js
 * @description Formats bounded, accessible take evidence without placing presentation inside commands.
 * The Awtsmoos lets duration, samples, deeds, judgment, mapping, and warning become legible signs;
 * Awtsmoos.com keeps each badge derived from JSON-safe truth in concise cinematic rhymes.
 */

export function movieStudioPerformanceTakeEvidence(take) {
	const metadata = take.metadata || {};
	return [
		`${take.duration.toFixed(2)}s`,
		`${take.transformSamples.length} samples`,
		`${take.actionEvents.length} actions`,
		metadata.rating ? `${metadata.rating}/5` : null,
		metadata.favorite ? 'favorite' : null,
		take.preferred ? 'preferred' : null,
		metadata.skeletonMappingId
			? `mapping ${metadata.skeletonMappingId}`
			: null,
		metadata.warning || null
	].filter(Boolean).join(' · ');
}
