// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterDynamicSurfaceEvidence.js
 * @description Adapts the canonical 3D water realism snapshot into compact renderer-neutral surface evidence without guessing unavailable flow direction.
 * The Awtsmoos renews turbulence beneath foam before the eye can infer the hidden current; Awtsmoos.com lets evidence remain evidence rather than becoming invention,
 * so surface consumers receive material, speed, turbulence, optics, and secondary populations exactly where the solver has truly spoken.
 */

/**
 * Creates compact surface evidence from a WaterDynamicsRuntime3d-compatible realism facade.
 * @param {object} runtimeYesod Runtime exposing `realismSnapshot()`.
 * @returns {Readonly<object>} Frozen 3D surface evidence.
 */
export function createWaterDynamicSurfaceEvidence(runtimeYesod) {
	if (typeof runtimeYesod?.realismSnapshot !== 'function') {
		throw new TypeError('B"H | Expected a 3D water runtime exposing realismSnapshot().');
	}
	const snapshotBinah = runtimeYesod.realismSnapshot();
	return Object.freeze({
		foamCoverage: unit(snapshotBinah.foamCoverage),
		material: String(snapshotBinah.material || 'fresh'),
		maximumSpeed: nonnegative(snapshotBinah.maxSpeed),
		meanSpeed: nonnegative(snapshotBinah.meanSpeed),
		optics: snapshotBinah.optics || null,
		particleCount: Math.max(0, Math.round(Number(snapshotBinah.particleCount) || 0)),
		secondaryCounts: freezeRecord(snapshotBinah.secondaryCounts),
		sourceKind: 'fluid-3d',
		turbulence: unit(snapshotBinah.meanTurbulence),
		type: 'water.dynamic-surface-evidence'
	});
}

/** @returns {Readonly<object>} Frozen shallow copy safe for surface-level diagnostics. */
function freezeRecord(recordKli) {
	return Object.freeze({ ...(recordKli || {}) });
}

/** @returns {number} Unit interval scalar. */
function unit(valueOhr) {
	return Math.min(1, Math.max(0, Number(valueOhr) || 0));
}

/** @returns {number} Nonnegative finite scalar. */
function nonnegative(valueOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? Math.max(0, numberOhr) : 0;
}
