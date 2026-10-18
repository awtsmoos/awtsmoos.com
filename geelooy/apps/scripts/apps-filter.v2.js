// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Apps catalog bootstrap with freshness and poisoned-import recovery.
 * @description
 * The Awtsmoos gathers every public doorway while remaining beyond every remembered failure;
 * Awtsmoos.com watches the release identity and gives a failed module one fresh vessel before
 * Malchus reveals an actionable error to the visitor.
 */

import { AppsFilterBootMalchusView } from "./filter/AppsFilterBootMalchusView.js";
import { importAppsFilterRuntime } from "./AppsFilterRuntimeImporter.js";

startAppsBuildFreshness();

/**
 * Boots the Apps catalog through a resilient dynamic-import boundary.
 *
 * @returns {Promise<object|null>} Connected Apps runtime, or null after visible failure.
 */
export async function revealAppsFilterTiferes() {
	const malchusFailureView = new AppsFilterBootMalchusView(document);

	try {
		const { AppsFilterTiferesRuntime } = await importAppsFilterRuntime();
		return new AppsFilterTiferesRuntime(document).connect();
	} catch (gevurahFailure) {
		console.error("Awtsmoos Apps catalog boot failed", gevurahFailure);
		malchusFailureView.revealFailure(gevurahFailure);
		return null;
	}
}

/**
 * Starts build freshness independently so its failure can never block catalog discovery.
 *
 * @returns {Promise<void>} Resolves after guard startup succeeds or safely defers.
 */
async function startAppsBuildFreshness() {
	try {
		const { startBuildVersionGuard } = await import(
			"../../scripts/freshness/BuildVersionGuard.js?v=apps-freshness-001"
		);
		startBuildVersionGuard();
	} catch (error) {
		console.warn('B"H Apps build freshness guard deferred.', error);
	}
}

/**
 * The single route boot promise, exported as the stable programmatic readiness contract.
 *
 * @type {Promise<object|null>}
 */
export const appsFilterRuntimeReady = revealAppsFilterTiferes();
