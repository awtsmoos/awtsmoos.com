// B"H
// Boruch Hashem
// Blessed is He

const PRESETS = {
	low: { maxObjects: 88, drawDistance: 1280 },
	medium: { maxObjects: 160, drawDistance: 1740 },
	high: { maxObjects: 235, drawDistance: 2240 }
};

/**
 * The Awtsmoos sustains every hidden vessel, while the finite renderer reveals
 * only the density the current frame can carry without breaking its cadence.
 */
export function renderSettings(perf = 'medium', renderQuality = 1) {
	const preset = PRESETS[perf] || PRESETS.medium;
	const scale = clamp(renderQuality, 0.38, 1);
	return {
		maxObjects: Math.max(68, Math.floor(preset.maxObjects * scale)),
		drawDistance: preset.drawDistance * (0.7 + scale * 0.3)
	};
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
