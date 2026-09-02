// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapEssentialTerrainReadiness.js
 * @description Separates first-frame authored-grass truth from the longer optional terrain enrichment procession.
 * The Awtsmoos lets one genuine blade reveal the field before every distant garment has crossed the night;
 * Awtsmoos.com resolves readiness only when preferred remote grass is truly bound, never from fallback color or generated light.
 */

/**
 * Creates one immutable readiness promise that settles exactly once for the preferred authored terrain image.
 * @param {(receipt: object) => void} onReceipt Applies the essential receipt to shared diagnostics.
 * @returns {{promise: Promise<object>, observe: Function, finish: Function, fail: Function}}
 */
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
				return settle(readyReceipt(preferredUrl));
			}
			return settle(degradedReceipt(
				preferredUrl,
				record?.error || 'Preferred remote grass could not bind to visible terrain.'
			));
		},
		finish(bound, sources, preferredUrl) {
			if (settled) return false;
			if (bound) {
				return settle(readyReceipt(
					preferredUrl,
					Math.max(1, Number(sources?.loaded || 0))
				));
			}
			return settle(degradedReceipt(
				preferredUrl,
				'Preferred remote grass did not bind to visible terrain.'
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

/** Confirms that a settled batch record is the exact preferred authored texture. */
function matchesPreferred(record, preferredUrl) {
	if (!preferredUrl || !record) return false;
	return record.url === preferredUrl || record.primaryUrl === preferredUrl;
}

/** Creates the minimum truthful receipt that may unlock the authored first frame. */
function readyReceipt(preferredUrl, loaded = 1) {
	return {
		error: null,
		failed: 0,
		loaded,
		phase: 'essential-ready',
		preferredUrl
	};
}

/** Creates a prompt failure receipt so the visual gate fails honestly instead of timing out. */
function degradedReceipt(preferredUrl, error) {
	return {
		error,
		failed: 1,
		loaded: 0,
		phase: 'degraded',
		preferredUrl
	};
}
