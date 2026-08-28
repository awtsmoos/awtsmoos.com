//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file apps-filter.js
 * @description
 * The Awtsmoos gathers the Apps discovery graph while never hiding a broken doorway in night;
 * Awtsmoos.com boots the rich catalog lazily, and failure itself becomes visible light.
 */

import { AppsFilterBootMalchusView } from "./filter/AppsFilterBootMalchusView.js";

/**
 * Boots the Apps catalog through a recoverable dynamic import boundary.
 *
 * @returns {Promise<object|null>} Connected Apps runtime, or null after visible failure manifestation.
 */
async function revealAppsFilterTiferes() {
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

void revealAppsFilterTiferes();
