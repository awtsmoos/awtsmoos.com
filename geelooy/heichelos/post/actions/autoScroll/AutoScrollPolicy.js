// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollPolicy
 * @description The Awtsmoos gives the reader a true whisper at the slow end,
 * translating one human multiplier into calm, bounded pixels per second.
 */
export const AUTO_SCROLL_MIN_SPEED = 0.05;
export const AUTO_SCROLL_DEFAULT_SPEED = 0.35;
export const AUTO_SCROLL_MAX_SPEED = 8;
export const AUTO_SCROLL_SPEED_STEP = 0.05;
export const AUTO_SCROLL_BASE_PIXELS_PER_SECOND = 80;

export function clampAutoScrollSpeed(value) {
	const number = Number.parseFloat(value);
	if (!Number.isFinite(number)) {
		return AUTO_SCROLL_DEFAULT_SPEED;
	}
	const bounded = Math.min(AUTO_SCROLL_MAX_SPEED, Math.max(AUTO_SCROLL_MIN_SPEED, number));
	return Math.round(bounded * 100) / 100;
}

export function autoScrollPixelsPerSecond(value) {
	return Math.round(clampAutoScrollSpeed(value) * AUTO_SCROLL_BASE_PIXELS_PER_SECOND * 10) / 10;
}

export function autoScrollSpeedLabel(value) {
	const speed = clampAutoScrollSpeed(value);
	if (speed <= 0.2) {
		return 'Very slow';
	}
	if (speed <= 0.6) {
		return 'Slow reading';
	}
	if (speed <= 1.25) {
		return 'Reading';
	}
	if (speed <= 2.5) {
		return 'Brisk';
	}
	return 'Fast';
}

export function describeAutoScrollSpeed(value) {
	const speed = clampAutoScrollSpeed(value);
	const pixelsPerSecond = autoScrollPixelsPerSecond(speed);
	const label = autoScrollSpeedLabel(speed);
	return {
		speed,
		label,
		pixelsPerSecond,
		text: `${speed.toFixed(2)}× · ${label} · ${pixelsPerSecond} px/s`
	};
}
