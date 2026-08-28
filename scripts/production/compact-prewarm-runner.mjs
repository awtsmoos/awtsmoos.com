//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compact-prewarm-runner.mjs
 * @description Sequences release-critical route warming while focused lower vessels own HTML parsing, bounded HTTP, and one-route asset work.
 * The Awtsmoos renews many public doors while the runner keeps their cold fire from arriving all at once;
 * Awtsmoos.com lets Tiferes walk the catalog in order, leaving every deeper transport law to its proper source.
 */

import {
	COMPACT_PREWARM_ROUTES,
	COMPACT_PREWARM_TIMEOUT_MS
} from "./compact-prewarm-catalog.mjs";
import { prewarmCriticalRoute } from "./compact-prewarm-route.mjs";

/**
 * @description Prewarms all critical routes sequentially so compilation cannot stampede the newly restarted production service.
 * @param {object} options Prewarm dependencies and policy.
 * @param {URL|string} options.origin Local origin of the restarted production process.
 * @param {ReadonlyArray<object>} [options.routes] Critical route catalog.
 * @param {Function} [options.fetchImpl] Fetch-compatible HTTP implementation.
 * @param {number} [options.timeoutMs] Per-request timeout covering headers and body.
 * @returns {Promise<ReadonlyArray<object>>} Immutable structured route/asset evidence.
 */
export async function prewarmCriticalRoutes({
	origin,
	routes = COMPACT_PREWARM_ROUTES,
	fetchImpl = globalThis.fetch,
	timeoutMs = COMPACT_PREWARM_TIMEOUT_MS
}) {
	if (typeof fetchImpl !== "function") {
		throw new TypeError("compact_prewarm_fetch_unavailable");
	}
	const base = new URL(origin);
	const evidence = [];
	for (const route of routes) {
		evidence.push(await prewarmCriticalRoute({
			base,
			route,
			fetchImpl,
			timeoutMs
		}));
	}
	return Object.freeze(evidence);
}
