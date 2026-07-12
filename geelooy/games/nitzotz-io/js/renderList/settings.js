// B"H

const PRESETS = {
	low: { maxObjects: 110, drawDistance: 1350 },
	medium: { maxObjects: 190, drawDistance: 1850 },
	high: { maxObjects: 280, drawDistance: 2350 }
};

/** Scale draw density without mutating arena population or gameplay rules. */
export function renderSettings(perf = 'medium', quality = 1) {
	const preset = PRESETS[perf] || PRESETS.medium;
	const scale = Math.max(0.44, Math.min(1, quality));
	return {
		maxObjects: Math.max(82, Math.floor(preset.maxObjects * scale)),
		drawDistance: preset.drawDistance * (0.72 + scale * 0.28)
	};
}
