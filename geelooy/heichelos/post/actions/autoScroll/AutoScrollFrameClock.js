// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollFrameClock
 * @description The Awtsmoos lends the semantic river a native animation clock,
 * with a deterministic timer fallback for tests and older browser vessels.
 */
export function requestAutoScrollFrame(callback) {
	return globalThis.requestAnimationFrame?.(callback)
		?? setTimeout(() => callback(Date.now()), 16);
}

export function cancelAutoScrollFrame(frame) {
	if (!frame) {
		return;
	}
	if (globalThis.cancelAnimationFrame) {
		globalThis.cancelAnimationFrame(frame);
	} else {
		clearTimeout(frame);
	}
}
