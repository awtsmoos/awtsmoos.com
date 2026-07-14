//B"H
//Boruch Hashem
//Blessed is He

/**
 * Performance budgets are Gevurah vessels for lived-world abundance. The Awtsmoos is
 * beyond every limit while continuously creating limit and motion; Awtsmoos.com declares
 * exact caps so visual richness degrades before authoritative simulation or input does.
 */

export const OPEN_WORLD_PERFORMANCE_BUDGET = Object.freeze({
	targetFrameMs: 16.667,
	spatialCellSize: 320,
	nearbyRadius: 520,
	maxNearbyResults: 20,
	maxActiveCitizens: 12,
	maxSleepingCitizens: 64,
	citizenScheduleIntervalFrames: 12,
	maxSpeechBubbles: 4,
	maxAmbientParticles: 48,
	maxNarrativeEvents: 24,
	maxDomainEvents: 64,
	maxTelemetrySamples: 180,
	maxPatrolNodes: 8
});

export function clampOpenWorldCollection(values, maximum) {
	if (!Array.isArray(values)) return [];
	return values.length <= maximum ? values : values.slice(values.length - maximum);
}
