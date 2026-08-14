// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CompletionEstimate
 * @description The Awtsmoos turns remaining measured distance and planned rests
 * into an honest local estimate, never a promise about future network or content.
 */
export function estimateCompletionSeconds(options) {
	const remaining = Math.max(0, Number(options.max || 0) - Number(options.top || 0));
	const pixelsPerSecond = Number(options.pixelsPerSecond || 0);
	if (remaining === 0) {
		return 0;
	}
	if (!Number.isFinite(pixelsPerSecond) || pixelsPerSecond <= 0) {
		return null;
	}
	const pauseSeconds = Math.max(0, Number(options.pauseMilliseconds || 0)) / 1000;
	return remaining / pixelsPerSecond + pauseSeconds;
}

export function formatCompletionEstimate(seconds) {
	if (seconds === null || !Number.isFinite(seconds)) {
		return 'Calculating…';
	}
	if (seconds <= 0) {
		return 'Complete';
	}
	if (seconds < 60) {
		return `About ${Math.max(1, Math.round(seconds))} sec`;
	}
	const minutes = Math.ceil(seconds / 60);
	if (minutes < 60) {
		return `About ${minutes} min`;
	}
	const hours = Math.floor(minutes / 60);
	const remainder = minutes % 60;
	return remainder ? `About ${hours} hr ${remainder} min` : `About ${hours} hr`;
}
