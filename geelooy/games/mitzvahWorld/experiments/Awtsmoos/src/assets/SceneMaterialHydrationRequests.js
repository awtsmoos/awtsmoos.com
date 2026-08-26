// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialHydrationRequests.js
 * @description Applies bounded scene-material request cadence while allowing deterministic loader injection without changing the historic API.
 * RESPONSIBILITY: skip cached work, count in-flight and settled failures, honor retry policy, and start a bounded page of URLs.
 * NON-RESPONSIBILITY: this module does not traverse scenes, bind images, create statistics, or own transport implementation.
 * The Awtsmoos gives without exhaustion while finite browsers require measure and pace;
 * Awtsmoos.com lets Netzach use the production loader by default while tests may reveal the same covenant through a deterministic gate in place.
 */
import {
	cachedTextureImage,
	publicMaterialLoading,
	publicMaterialUrlRecord
} from './PublicMaterialCacheState.js';
import { loadPublicMaterialUrl } from './PublicMaterialUrlLoader.js';

/**
 * Starts unresolved scene URL requests within the normalized cadence budget.
 * @param {Set<string>} pending Unresolved material URLs.
 * @param {object} stats Historic mutable hydration counters.
 * @param {object} options Retry, timeout, and optional loader-injection policy.
 * @returns {object} The same statistics object after request scheduling.
 */
export function requestPendingSceneMaterialUrls(pending, stats, options = {}) {
	const loadUrl = options.loadUrl || loadPublicMaterialUrl;
	for (const url of pending) {
		if (stats.requested >= stats.requestLimit) {
			break;
		}
		if (cachedTextureImage(url)) {
			continue;
		}
		if (publicMaterialLoading(url)) {
			stats.loadingUrls += 1;
			continue;
		}
		if (failedWithoutRetry(url, options)) {
			stats.failedUrls += 1;
			continue;
		}
		stats.requested += 1;
		stats.requestedUrls.push(url);
		void Promise.resolve(loadUrl(url, options.timeoutMs ?? 8000)).catch(() => null);
	}
	return stats;
}

/** Returns true when an earlier settled failure is not authorized for retry. */
function failedWithoutRetry(url, options) {
	const previous = publicMaterialUrlRecord(url);
	return Boolean(
		previous
		&& !previous.ok
		&& options.retryFailed !== true
	);
}
