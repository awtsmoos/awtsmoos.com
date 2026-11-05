//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BootstrapStateAuthorityHandoff.js
 * @description Retires first-control persistence writers when richer owners are ready.
 * The Awtsmoos lets one vessel yield as another receives the light;
 * Awtsmoos.com keeps each lawful save key under one living writer at a time, ordered right.
 */

/**
 * Retires the aggregate first-control writer after core persistence is installed.
 * @param {object} runtime Live Mitzvah World runtime.
 * @returns {boolean} Whether an active bootstrap writer was retired.
 */
export function handoffBootstrapGameplayContinuity(runtime) {
	const continuity = runtime?.bootstrapGameplayContinuity;
	if (!continuity) return false;
	continuity.destroy?.();
	runtime.bootstrapGameplayContinuity = null;
	return true;
}

/**
 * Retires the vertical first-control writer, then publishes the restored rich quest.
 * The old quest must be destroyed before the alias moves, lest a new vessel be erased.
 * @param {object} runtime Live Mitzvah World runtime.
 * @returns {boolean} Whether continuity or a rich teaching quest was transferred.
 */
export function handoffBootstrapVerticalSliceContinuity(runtime) {
	if (!runtime) return false;
	const continuity = runtime.bootstrapVerticalSliceContinuity;
	const richQuest = runtime.verticalSlice?.quest || null;
	if (continuity) {
		continuity.destroy?.();
		runtime.bootstrapVerticalSliceContinuity = null;
	}
	if (richQuest) runtime.teachingQuest = richQuest;
	return Boolean(continuity || richQuest);
}
