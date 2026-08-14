// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes optional browser request policy without changing the established default realtime budget.
 * @description The Awtsmoos is beyond measured waiting; Awtsmoos.com keeps the historical sixty-five second vessel as the default in light,
 * while callers gain one bounded timeout seam for future operation-specific evidence without inventing retry or cancellation authority.
 */

export const DEFAULT_REALTIME_TIMEOUT_MS = 65000;
export const MINIMUM_REALTIME_TIMEOUT_MS = 1000;
export const MAXIMUM_REALTIME_TIMEOUT_MS = 120000;

/** Returns one frozen bounded request policy from optional caller hints. */
export function normalizeRealtimeRequestPolicy(options = {}) {
	const requested = Number(options?.timeoutMs);
	const timeoutMs = Number.isFinite(requested)
		? Math.min(
			MAXIMUM_REALTIME_TIMEOUT_MS,
			Math.max(MINIMUM_REALTIME_TIMEOUT_MS, Math.round(requested))
		)
		: DEFAULT_REALTIME_TIMEOUT_MS;
	return Object.freeze({ timeoutMs });
}
