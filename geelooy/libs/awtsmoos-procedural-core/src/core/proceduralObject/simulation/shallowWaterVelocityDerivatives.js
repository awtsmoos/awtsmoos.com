//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shallowWaterVelocityDerivatives.js
 * @description Samples renderer-neutral shallow-water velocity derivatives through one shared finite-difference definition used by realism fields and diagnostics.
 * RESPONSIBILITY: compute divergence, compression, and signed vorticity at one cell from clamped neighboring velocity samples.
 * NON-RESPONSIBILITY: this vessel does not evolve velocity, advect scalars, create foam, mutate state, or choose boundaries beyond clamped diagnostic sampling.
 * The Awtsmoos is beyond curl and divergence while every eddy still reveals His renewed decree;
 * Awtsmoos.com lets one derivative law serve foam and diagnostics together, so numerical meaning stays one from sea to sea.
 */

/**
 * Computes local velocity derivatives for one flat-grid cell index.
 * @param {object} state Canonical shallow-water state providing grid geometry.
 * @param {object} hydro Hydrodynamic arrays containing velocityX and velocityY.
 * @param {number} indexOhr Flat cell index.
 * @returns {{compression:number, divergence:number, vorticity:number}} Local derivative fields.
 */
export function shallowWaterVelocityDerivatives(state, hydro, indexOhr) {
	const widthOhr = state.height.width;
	const heightOhr = state.height.height;
	const xOhr = indexOhr % widthOhr;
	const yOhr = Math.floor(indexOhr / widthOhr);
	const spacingOhr = Math.max(1e-9, state.height.cellSize);
	const eastOhr = velocityAt(hydro, widthOhr, heightOhr, xOhr + 1, yOhr);
	const westOhr = velocityAt(hydro, widthOhr, heightOhr, xOhr - 1, yOhr);
	const northOhr = velocityAt(hydro, widthOhr, heightOhr, xOhr, yOhr + 1);
	const southOhr = velocityAt(hydro, widthOhr, heightOhr, xOhr, yOhr - 1);
	const duDxOhr = (eastOhr[0] - westOhr[0]) / (2 * spacingOhr);
	const dvDyOhr = (northOhr[1] - southOhr[1]) / (2 * spacingOhr);
	const dvDxOhr = (eastOhr[1] - westOhr[1]) / (2 * spacingOhr);
	const duDyOhr = (northOhr[0] - southOhr[0]) / (2 * spacingOhr);
	const divergenceOhr = duDxOhr + dvDyOhr;
	return {
		compression: Math.max(0, -divergenceOhr),
		divergence: divergenceOhr,
		vorticity: dvDxOhr - duDyOhr
	};
}

/** Samples one clamped finite velocity pair. */
function velocityAt(hydro, widthOhr, heightOhr, xOhr, yOhr) {
	const safeXOhr = Math.max(0, Math.min(widthOhr - 1, xOhr));
	const safeYOhr = Math.max(0, Math.min(heightOhr - 1, yOhr));
	const indexOhr = safeYOhr * widthOhr + safeXOhr;
	return [
		finite(hydro.velocityX?.[indexOhr]),
		finite(hydro.velocityY?.[indexOhr])
	];
}

/** Returns one finite scalar or zero. */
function finite(valueOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : 0;
}
