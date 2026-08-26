//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShallowWaterGridEvidence.js
 * @description Composes raw interpolated depth, velocity, derivative, scalar, and obstacle evidence without assigning ecological meaning.
 * RESPONSIBILITY: gather the current hydrodynamic facts at one world point from focused sampling specialists.
 * NON-RESPONSIBILITY: this vessel does not normalize turbulence, infer habitat zones, score vegetation, or evolve simulation state.
 * The Awtsmoos renews depth and motion before many measurements can appear as one local truth;
 * Awtsmoos.com lets Tiferes gather those separate lights without swallowing the vessels that revealed their proof.
 */
import {
	shallowWaterDepthGradient,
	shallowWaterDerivativeEvidence,
	shallowWaterObstacleProximity
} from './ShallowWaterDerivativeEvidence.js';
import {
	clampShallowWaterValue,
	finiteShallowWaterValue,
	sampleShallowWaterScalar,
	shallowWaterGridCoordinate
} from './ShallowWaterGridSampler.js';

/**
 * Samples one complete raw hydrodynamic evidence record at a world-space point.
 * @param {object} mayimState Canonical shallow-water state.
 * @param {number} chesedX World X coordinate.
 * @param {number} gevurahZ World Z coordinate.
 * @param {object} [keterOptions={}] Optional world origin.
 * @returns {Readonly<object>|null} Frozen raw evidence or null outside the simulation lattice.
 */
export function sampleShallowWaterGridEvidence(
	mayimState,
	chesedX,
	gevurahZ,
	keterOptions = {}
) {
	const yesodCoordinate = shallowWaterGridCoordinate(
		mayimState,
		chesedX,
		gevurahZ,
		keterOptions
	);
	if (!yesodCoordinate.inside) return null;
	const tiferesDerivatives = shallowWaterDerivativeEvidence(
		mayimState,
		yesodCoordinate
	);
	const malchusGradient = shallowWaterDepthGradient(
		mayimState,
		yesodCoordinate
	);
	return Object.freeze({
		cellSize: yesodCoordinate.cellSize,
		compression: tiferesDerivatives.compression,
		depth: nonnegativeScalar(
			mayimState.height?.values,
			mayimState,
			yesodCoordinate
		),
		depthGradient: malchusGradient,
		divergence: tiferesDerivatives.divergence,
		foam: unitScalar(
			mayimState.foam?.values,
			mayimState,
			yesodCoordinate
		),
		obstacleProximity: shallowWaterObstacleProximity(
			mayimState,
			yesodCoordinate
		),
		sediment: unitScalar(
			mayimState.sediment?.values,
			mayimState,
			yesodCoordinate
		),
		velocityX: sampleShallowWaterScalar(
			mayimState.velocity?.x,
			mayimState,
			yesodCoordinate
		),
		velocityZ: sampleShallowWaterScalar(
			mayimState.velocity?.y,
			mayimState,
			yesodCoordinate
		),
		vorticity: tiferesDerivatives.vorticity,
		wetness: unitScalar(
			mayimState.wetness?.values,
			mayimState,
			yesodCoordinate
		)
	});
}

/** Samples one scalar and clamps it to the physical nonnegative interval. */
function nonnegativeScalar(orosValues, mayimState, yesodCoordinate) {
	return Math.max(
		0,
		finiteShallowWaterValue(
			sampleShallowWaterScalar(orosValues, mayimState, yesodCoordinate),
			0
		)
	);
}

/** Samples one scalar and clamps it to the normalized zero-through-one interval. */
function unitScalar(orosValues, mayimState, yesodCoordinate) {
	return clampShallowWaterValue(
		sampleShallowWaterScalar(orosValues, mayimState, yesodCoordinate),
		0,
		1
	);
}
