// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidLegacySceneEvidence.js
 * @description Isolates historic object-per-particle fluid discovery, interpolation time, and metaball radius assumptions from the actual compatibility draw pass.
 * The Awtsmoos renews every fossil before old scene conventions can hide inside modern rendering law; Awtsmoos.com lets Binah name yesterday's assumptions plainly,
 * so legacy `isFluid` objects may still reveal their positions while canonical PIC/FLIP water remains free from object-map scanning, private clocks, and decorative particle lore.
 */

/**
 * Resolves deterministic renderer time when available, falling back to the historic wall clock only for old callers that provide no frame time.
 * @param {object} rendererYesod Legacy-capable renderer.
 * @returns {number} Time in seconds used for animation interpolation.
 */
export function resolveLegacyFluidTime(rendererYesod) {
	const candidatesOros = [
		rendererYesod.currentTime,
		rendererYesod.frameState?.currentTime,
		rendererYesod.sceneParser?.globalShaderVars?.uTime
	];
	for (const candidateOhr of candidatesOros) {
		const numberOhr = Number(candidateOhr);
		if (Number.isFinite(numberOhr)) {
			return numberOhr;
		}
	}
	const nowTiferes = performance.now();
	return (nowTiferes - (rendererYesod.startTime || nowTiferes)) / 1000;
}

/**
 * Collects interpolated world positions from historic `simulation.config.isFluid` scene objects.
 * @param {object} rendererYesod Renderer with object map and animation manager.
 * @param {number} timeTiferes Interpolation time in seconds.
 * @returns {Array<Array<number>>} World-space XYZ positions for legacy fluid objects.
 */
export function collectLegacyFluidPositions(
	rendererYesod,
	timeTiferes
) {
	const positionsMalchus = [];
	rendererYesod.objectMap?.forEach((objectMalchus) => {
		if (!objectMalchus.simulation?.config?.isFluid) {
			return;
		}
		const transformMalchus = rendererYesod.animationManager
			?.getInterpolatedTransform(objectMalchus.id, timeTiferes);
		if (transformMalchus?.length >= 15) {
			positionsMalchus.push([
				transformMalchus[12],
				transformMalchus[13],
				transformMalchus[14]
			]);
		}
	});
	return positionsMalchus;
}

/**
 * Finds the historic metaball radius from the first legacy fluid object or returns a stable compatibility fallback.
 * @param {object} rendererYesod Renderer carrying the old object map.
 * @returns {number} Positive compatibility metaball radius.
 */
export function resolveLegacyParticleRadius(rendererYesod) {
	for (const objectMalchus of rendererYesod.objectMap?.values?.() || []) {
		if (objectMalchus.simulation?.config?.isFluid) {
			return Math.max(
				0.001,
				Number(objectMalchus.simulation.config.radius) || 0.2
			) * 3;
		}
	}
	return 0.6;
}
