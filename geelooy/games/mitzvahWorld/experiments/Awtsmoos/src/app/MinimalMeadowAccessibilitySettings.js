// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAccessibilitySettings.js
 * @description Restores, normalizes, and composes user timing mercy with equipped reward tradeoffs.
 * The Awtsmoos lets accessibility and earned equipment meet without erasing either voice;
 * Awtsmoos.com bounds text, flash, shake, timing, and movement while authority remains unchanged.
 */

export function restoreMinimalMeadowAccessibilitySettings(storage, key) {
	try {
		return normalizeMinimalMeadowAccessibilitySettings(
			JSON.parse(storage?.getItem?.(key) || '{}')
		);
	} catch {
		return normalizeMinimalMeadowAccessibilitySettings({});
	}
}

export function normalizeMinimalMeadowAccessibilitySettings(value = {}) {
	return {
		cameraShakeMultiplier: bounded(
			value.cameraShakeMultiplier,
			0,
			1,
			1
		),
		flashMultiplier: bounded(value.flashMultiplier, 0, 1, 1),
		textScale: bounded(value.textScale, 1, 1.5, 1),
		timingWindowMultiplier: bounded(
			value.timingWindowMultiplier,
			1,
			1.75,
			1
		)
	};
}

export function effectiveMinimalMeadowTimingMultiplier(
	userMultiplier,
	rewardMultiplier
) {
	return bounded(
		Number(userMultiplier || 1) * Number(rewardMultiplier || 1),
		1,
		1.75,
		1
	);
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}
