// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapEssentialTerrainReadiness.js
 * @description Resolves terrain hydration on preferred authored grass immediately or on the first canonical remote grass fallback after the batch settles.
 * The Awtsmoos prefers one named garment without mistaking preference for exclusivity; Awtsmoos.com lets a later verified grass role clothe the same field
 * when the preferred file times out, while generated color and failed decodes can never masquerade as authored terrain truth.
 */

/** Creates one immutable readiness promise that settles exactly once for verified remote grass. */
export function createBootstrapEssentialTerrainReadiness(onReceipt = () => {}) {
	let settled = false;
	let resolvePromise;
	const promise = new Promise(resolve => {
		resolvePromise = resolve;
	});
	const settle = receipt => {
		if (settled) return false;
		settled = true;
		const frozen = Object.freeze(receipt);
		onReceipt(frozen);
		resolvePromise(frozen);
		return true;
	};
	return Object.freeze({
		promise,
		observe(record, bound, preferredUrl) {
			if (!matchesPreferred(record, preferredUrl)) return false;
			if (record?.ok && bound) {
				return settle(readyReceipt(preferredUrl, preferredUrl, 1));
			}
			return false;
		},
		finish(bound, sources, preferredUrl, activeUrl = '') {
			if (settled) return false;
			if (bound && activeUrl) {
				return settle(readyReceipt(
					preferredUrl,
					activeUrl,
					Math.max(1, Number(sources?.loaded || 0))
				));
			}
			return settle(degradedReceipt(
				preferredUrl,
				'No canonical remote grass could bind to visible terrain.'
			));
		},
		fail(error, preferredUrl = '') {
			return settle(degradedReceipt(
				preferredUrl,
				error?.message || String(error)
			));
		}
	});
}

function matchesPreferred(record, preferredUrl) {
	if (!preferredUrl || !record) return false;
	return record.url === preferredUrl || record.primaryUrl === preferredUrl;
}

function readyReceipt(preferredUrl, activeUrl, loaded = 1) {
	return {
		activeUrl,
		error: null,
		failed: 0,
		loaded,
		phase: activeUrl === preferredUrl ? 'essential-ready' : 'canonical-fallback-ready',
		preferred: activeUrl === preferredUrl,
		preferredUrl
	};
}

function degradedReceipt(preferredUrl, error) {
	return {
		activeUrl: null,
		error,
		failed: 1,
		loaded: 0,
		phase: 'degraded',
		preferred: false,
		preferredUrl
	};
}
