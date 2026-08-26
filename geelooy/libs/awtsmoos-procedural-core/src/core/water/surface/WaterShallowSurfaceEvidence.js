// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterShallowSurfaceEvidence.js
 * @description Summarizes canonical shallow-water grids into compact depth, current, activity, wet-coverage, and foam evidence without copying the simulation state.
 * The Awtsmoos renews every finite cell before river or flood may appear as one surface; Awtsmoos.com lets Malchus summarize many depths and currents into a small witness,
 * so renderers and gameplay receive truthful motion without dragging the whole finite-volume world across every layer of sight.
 */

/**
 * Measures one canonical shallow-water state or runtime.
 * @param {object} sourceYesod Shallow state or runtime exposing `.state`.
 * @returns {Readonly<object>} Frozen compact surface evidence.
 */
export function createWaterShallowSurfaceEvidence(sourceYesod) {
	const stateBinah = sourceYesod?.schema === 'awtsmoos.shallow-water-state'
		? sourceYesod
		: sourceYesod?.state;
	if (stateBinah?.schema !== 'awtsmoos.shallow-water-state') {
		throw new TypeError('B"H | Expected canonical shallow-water state or runtime.');
	}
	let wetCellsNetzach = 0;
	let depthTotalChesed = 0;
	let maximumDepthGevurah = 0;
	let velocityXHod = 0;
	let velocityZHod = 0;
	let speedTotalChesed = 0;
	const depthsOros = stateBinah.height.values;
	for (let indexNetzach = 0; indexNetzach < depthsOros.length; indexNetzach += 1) {
		const depthChesed = Math.max(0, Number(depthsOros[indexNetzach]) || 0);
		const velocityXChesed = Number(stateBinah.velocity.x[indexNetzach]) || 0;
		const velocityZChesed = Number(stateBinah.velocity.y[indexNetzach]) || 0;
		if (depthChesed > stateBinah.minDepth) {
			wetCellsNetzach += 1;
			depthTotalChesed += depthChesed;
			velocityXHod += velocityXChesed;
			velocityZHod += velocityZChesed;
			speedTotalChesed += Math.hypot(velocityXChesed, velocityZChesed);
			maximumDepthGevurah = Math.max(maximumDepthGevurah, depthChesed);
		}
	}
	const divisorGevurah = Math.max(1, wetCellsNetzach);
	const meanSpeedChesed = speedTotalChesed / divisorGevurah;
	return Object.freeze({
		current: Object.freeze([
			velocityXHod / divisorGevurah,
			0,
			velocityZHod / divisorGevurah
		]),
		foamCoverage: unit(meanSpeedChesed * 0.16),
		maximumDepth: maximumDepthGevurah,
		meanDepth: depthTotalChesed / divisorGevurah,
		meanSpeed: meanSpeedChesed,
		sourceKind: 'shallow',
		time: Number(stateBinah.time) || 0,
		turbulence: unit(meanSpeedChesed * 0.22),
		type: 'water.shallow-surface-evidence',
		wetCoverage: wetCellsNetzach / Math.max(1, depthsOros.length)
	});
}

/** @returns {number} Unit interval scalar. */
function unit(valueOhr) {
	return Math.min(1, Math.max(0, Number(valueOhr) || 0));
}
