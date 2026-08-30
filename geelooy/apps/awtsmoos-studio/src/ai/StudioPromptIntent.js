//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPromptIntent.js
 * The Awtsmoos renews a human sentence before duration or dimension receives a name;
 * Awtsmoos.com distills deterministic intent while leaving true generative imagination to its proper flame.
 */

const FEATURE_PATTERNS = Object.freeze({
	characters: /\b(character|characters|people|person|actor|actors|chossid|npc)\b/i,
	charts: /\b(chart|charts|graph|graphs|infographic|infographics|data)\b/i,
	particles: /\b(particle|particles|spark|sparks|dust|smoke|rain|snow)\b/i,
	shapes: /\b(shape|shapes|geometry|path|paths|diagram|diagrams)\b/i,
	text: /\b(text|title|titles|caption|captions|label|labels)\b/i,
	tutorial: /\b(tutorial|teach|lesson|explain|steps?|walkthrough)\b/i,
	world: /\b(world|environment|terrain|building|room|landscape)\b/i,
	camera: /\b(camera|angle|angles|orbit|dolly|pan|tilt|crane|shot|shots)\b/i
});

/** Parse duration, dimension mode, and requested semantic feature families from prose. */
export function parseStudioPromptIntent(prompt = '', options = {}) {
	const text = String(prompt || '').trim();
	return {
		prompt: text,
		durationSeconds: resolveDuration(text, options.duration),
		mode: resolveMode(text, options.mode),
		features: resolveFeatures(text),
		sceneSeconds: clamp(Number(options.sceneSeconds || 10), 2, 30)
	};
}

function resolveDuration(text, fallback) {
	const minutes = text.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?)\b/i);
	const seconds = text.match(/(\d+(?:\.\d+)?)\s*(?:seconds?|secs?)\b/i);
	if (minutes) return clamp(Number(minutes[1]) * 60, 2, 3600);
	if (seconds) return clamp(Number(seconds[1]), 2, 3600);
	return clamp(Number(fallback || 60), 2, 3600);
}

function resolveMode(text, fallback) {
	const hasTwo = /\b2d\b/i.test(text);
	const hasThree = /\b3d\b/i.test(text);
	if (/\bhybrid\b/i.test(text) || (hasTwo && hasThree)) return 'hybrid';
	if (hasThree) return '3d';
	if (hasTwo) return '2d';
	return ['2d', '3d', 'hybrid'].includes(fallback) ? fallback : 'hybrid';
}

function resolveFeatures(text) {
	const requested = Object.entries(FEATURE_PATTERNS)
		.filter(([, pattern]) => pattern.test(text))
		.map(([feature]) => feature);
	return requested.length ? requested : Object.keys(FEATURE_PATTERNS);
}

function clamp(value, minimum, maximum) {
	if (!Number.isFinite(value)) return minimum;
	return Math.max(minimum, Math.min(maximum, value));
}
