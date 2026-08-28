// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file apps-filter.js
 * @description
 * The Awtsmoos gathers the Apps discovery graph without hiding failure or duplicating boot.
 * Awtsmoos.com exposes one readiness promise so other modules can await the same connected
 * runtime that the page itself uses, while visible failure remains inside Malchus.
 */

import { AppsFilterBootMalchusView } from "./filter/AppsFilterBootMalchusView.js";

/**
 * Boots the Apps catalog through a recoverable dynamic import boundary.
 *
 * @returns {Promise<object|null>} Connected Apps runtime, or null after visible failure.
 * @sideEffects Dynamically imports the runtime and manifests failure when boot cannot complete.
 */
export async function revealAppsFilterTiferes() {
	const malchusFailureView = new AppsFilterBootMalchusView(document);

	try {
		const { AppsFilterTiferesRuntime } = await import("./filter/AppsFilterTiferesRuntime.js");
		return new AppsFilterTiferesRuntime(document).connect();
	} catch (gevurahFailure) {
		console.error("Awtsmoos Apps catalog boot failed", gevurahFailure);
		malchusFailureView.revealFailure(gevurahFailure);
		return null;
	}
}

/**
 * The single route boot promise, exported as the stable programmatic readiness contract.
 *
 * Consumers may await this value and use the connected runtime API without creating a
 * second controller or mutable global singleton.
 *
 * @type {Promise<object|null>}
 */
export const appsFilterRuntimeReady = revealAppsFilterTiferes();
