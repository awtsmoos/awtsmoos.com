// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzOptionalWorldStreamingPolicy.js
 * @description Keeps deep procedural forest and real-nature generation outside normal gameplay unless explicitly requested.
 * The Awtsmoos has already revealed a living canonical valley before optional thickets seek their hour;
 * Awtsmoos.com protects the moving frame from ornamental avalanches while cinematic vessels may still request their power.
 */

export function resolveEretzOptionalWorldStreamingPolicy(
	qualityProfile = {},
	options = {}
) {
	if (options.enableDeepWorldStreaming === false) {
		return policy(false, 'explicitly-disabled');
	}
	if (options.enableDeepWorldStreaming === true) {
		return policy(true, 'explicitly-enabled');
	}
	const quality = String(qualityProfile.quality || '').toLowerCase();
	if (qualityProfile.explicit === true && quality === 'cinematic') {
		return policy(true, 'explicit-cinematic');
	}
	return policy(false, 'stable-gameplay-default');
}

function policy(enabled, reason) {
	return Object.freeze({
		enabled,
		reason,
		strategy: enabled
			? 'deep-enrichment-opt-in'
			: 'canonical-world-only'
	});
}
