// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets one root reveal distinct material voices without bloating the planner that chooses them;
 * Awtsmoos.com keeps leaf, stone, metal, mote, and spark recipes in their own small musical vessel.
 */
export function captureVoices(style, root) {
	if (style === 'leaf') {
		return [
			voice(root, root * 1.08, 0.09, 'triangle', 0.022),
			voice(root * 1.5, root * 1.58, 0.07, 'sine', 0.012, 0.012)
		];
	}
	if (style === 'stone') {
		return [
			voice(root, root * 0.82, 0.115, 'triangle', 0.032),
			voice(root * 1.8, root * 1.45, 0.055, 'sine', 0.013)
		];
	}
	if (style === 'metal') {
		return [
			voice(root, root * 0.9, 0.095, 'triangle', 0.03),
			voice(root * 2.02, root * 1.72, 0.06, 'sine', 0.014, 0.008)
		];
	}
	if (style === 'spark') {
		return [
			voice(root, root * 1.12, 0.11, 'sine', 0.03),
			voice(root * 1.5, root * 1.62, 0.12, 'triangle', 0.019, 0.014),
			voice(root * 2, root * 2.08, 0.08, 'sine', 0.012, 0.032)
		];
	}
	return [
		voice(root, root * 0.94, 0.075, 'sine', 0.024)
	];
}

/** Keep every recipe in the same bounded tonal envelope regardless of caller input. */
function voice(frequency, endFrequency, duration, type, gain, delay = 0) {
	return {
		frequency: clamp(frequency, 90, 1600),
		endFrequency: clamp(endFrequency, 90, 1600),
		duration: clamp(duration, 0.035, 0.18),
		type,
		gain: clamp(gain, 0.006, 0.04),
		delay: clamp(delay, 0, 0.08)
	};
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
