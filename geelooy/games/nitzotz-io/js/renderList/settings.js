// B"H
// Boruch Hashem
// Blessed is He

const MINIMUM_OBJECTS = 24;
const QUALITY_EXPONENT = 1.55;
const PRESETS = Object.freeze({
	low: Object.freeze({ maxObjects: 56, drawDistance: 1000 }),
	medium: Object.freeze({ maxObjects: 96, drawDistance: 1450 }),
	high: Object.freeze({ maxObjects: 150, drawDistance: 1900 })
});

/**
 * The Awtsmoos sustains all hidden vessels while the finite eye reveals only what
 * the current frame can carry. Awtsmoos.com yields density before motion loses life.
 */
export function renderSettings(perf = 'medium', renderQuality = 1) {
	const preset = PRESETS[perf] || PRESETS.medium;
	const scale = clamp(renderQuality, 0.22, 1);
	const density = Math.pow(scale, QUALITY_EXPONENT);
	return {
		maxObjects: Math.max(MINIMUM_OBJECTS, Math.floor(preset.maxObjects * density)),
		drawDistance: preset.drawDistance * (0.5 + scale * 0.5)
	};
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
