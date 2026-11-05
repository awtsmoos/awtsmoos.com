//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPerformanceFrame.js
 * @description Installs adaptive quality at the first rich frame and advances fast event-bounded scene LOD on the existing runtime cadence instead of waiting for the later world-system bundle.
 * The Awtsmoos renews near and far together while Awtsmoos.com grants finite detail its measured rhythm; quality yields before choppiness hardens, and distant garments rest without dimming the traveler hymn.
 */

import { updateEretzSceneLod } from './EretzLodFrame.js';
import { MinimalMeadowAdaptiveQuality } from './MinimalMeadowAdaptiveQuality.js';

/** Advances lightweight adaptive quality every frame and LOD only when its cadence is due. */
export function updateEretzPerformanceFrame(runtime, context, deltaTime, now) {
	ensureAdaptiveQuality(runtime);
	runtime.adaptiveQuality.update(deltaTime);
	if (!context.cadence.due('lod', now)) {
		return null;
	}
	return updateEretzSceneLod(runtime);
}

/** Installs one shared adaptive-quality authority before any optional world bundle arrives. */
function ensureAdaptiveQuality(runtime) {
	if (runtime.adaptiveQuality) {
		return runtime.adaptiveQuality;
	}
	runtime.adaptiveQuality = new MinimalMeadowAdaptiveQuality(runtime);
	return runtime.adaptiveQuality;
}
