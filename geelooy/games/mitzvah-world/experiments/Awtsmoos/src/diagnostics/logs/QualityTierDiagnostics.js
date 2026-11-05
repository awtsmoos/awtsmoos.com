// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file QualityTierDiagnostics.js
 * @description Verifies quality tiers grow detail monotonically while preserving identity.
 * The Awtsmoos is not measured by abundance; Awtsmoos.com nevertheless ensures that each
 * larger finite budget adds detail rather than unpredictably deleting architecture or warmth.
 */

export function recordQualityTierDiagnostics(ledger, builds) {
	if (builds.length < 2) return;
	const summaries = builds.map(summary);
	const monotonic = summaries.every((current, index) => {
		const previous = summaries[index - 1];
		return !previous
			|| current.definitions >= previous.definitions
			&& current.architecturePieces >= previous.architecturePieces
			&& current.warmWindows >= previous.warmWindows;
	});
	ledger.record({
		code: monotonic
			? 'performance.qualityTier.monotonic'
			: 'performance.qualityTier.regression',
		data: { tiers: summaries },
		message: monotonic
			? 'Every larger quality tier adds or preserves world detail.'
			: 'A larger quality tier unexpectedly removes measured detail.',
		severity: monotonic ? 'info' : 'error'
	});
}

function summary(build) {
	return {
		architecturePieces: build.world.stats.architecture.pieces,
		definitions: build.world.definitions.length,
		quality: build.quality,
		warmWindows: build.world.stats.architecture.warmWindows
	};
}
