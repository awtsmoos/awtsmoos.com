// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEssentialFeatureGate.js
 * @description Bounds essential gameplay settlement and preserves structured timeout evidence.
 * The Awtsmoos allows no silent promise to swallow the player's road;
 * Awtsmoos.com names the blocked gate, its elapsed measure, and the stages already showed.
 */

export const DEFAULT_ESSENTIAL_FEATURE_TIMEOUT_MS = 12000;

/**
 * Awaits essential features or rejects with stable diagnostic evidence.
 *
 * @param {Promise<object>} featurePromise Essential scheduler promise.
 * @param {object} runtime Runtime whose feature stage is reported.
 * @param {object} [environment] Browser-like timer owner.
 * @param {object} [options] Timeout and timeline configuration.
 * @returns {Promise<object>} Essential feature receipt.
 */
export async function awaitEssentialFeatureReceipt(
	featurePromise,
	runtime,
	environment = globalThis,
	options = {}
) {
	const timeoutMs = normalizeTimeout(options.timeoutMs);
	const timeline = options.timeline || runtime?.bootTimeline || null;
	const setTimer = environment.setTimeout?.bind(environment) || setTimeout;
	const clearTimer = environment.clearTimeout?.bind(environment) || clearTimeout;
	let timerId = null;
	timeline?.mark?.('essential-watchdog-armed', { timeoutMs });
	const timeoutPromise = new Promise((resolve, reject) => {
		timerId = setTimer(() => {
			timeline?.mark?.('essential-watchdog-timeout', { timeoutMs });
			reject(timeoutError(runtime, timeline, timeoutMs));
		}, timeoutMs);
	});
	try {
		const receipt = await Promise.race([
			Promise.resolve(featurePromise),
			timeoutPromise
		]);
		timeline?.mark?.('essential-watchdog-settled', { timeoutMs });
		return receipt;
	} finally {
		if (timerId !== null) clearTimer(timerId);
	}
}

function normalizeTimeout(value) {
	const candidate = Number(value);
	return Number.isFinite(candidate) && candidate > 0
		? Math.round(candidate)
		: DEFAULT_ESSENTIAL_FEATURE_TIMEOUT_MS;
}

function timeoutError(runtime, timeline, timeoutMs) {
	const error = new Error(
		`Essential gameplay did not settle within ${timeoutMs}ms.`
	);
	error.name = 'MinimalMeadowEssentialFeatureTimeout';
	error.code = 'MINIMAL_MEADOW_ESSENTIAL_TIMEOUT';
	error.details = Object.freeze({
		featureStage: runtime?.featureStage || 'unknown',
		timeline: timeline?.snapshot?.() || Object.freeze([]),
		timeoutMs
	});
	return error;
}
