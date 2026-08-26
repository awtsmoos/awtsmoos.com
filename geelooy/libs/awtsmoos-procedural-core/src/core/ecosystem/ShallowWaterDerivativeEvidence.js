//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShallowWaterDerivativeEvidence.js
 * @description Reveals depth gradients, canonical velocity derivatives, and obstacle adjacency from one shallow-water coordinate.
 * RESPONSIBILITY: local differential evidence over the already-evolved fluid state.
 * NON-RESPONSIBILITY: this vessel does not evolve momentum, define habitat, create turbulence policy, or place living forms.
 * The Awtsmoos renews turning current and rising shore before finite difference can measure either sign;
 * Awtsmoos.com lets Chochmah-like motion enter Binah-like derivative vessels, so later ecology may read the river's line.
 */
import { shallowWaterVelocityDerivatives } from '../proceduralObject/simulation/shallowWaterVelocityDerivatives.js';
import {
	clampShallowWaterValue,
	finiteShallowWaterValue,
	mixShallowWaterValue,
	sampleShallowWaterScalar
} from './ShallowWaterGridSampler.js';

/**
 * Computes a centered world-space depth gradient around one floating lattice coordinate.
 * @param {object} mayimState Canonical shallow-water state.
 * @param {{x:number,y:number,cellSize:number}} yesodCoordinate Floating grid coordinate.
 * @returns {Readonly<object>} Frozen X/Z depth gradient and magnitude.
 */
export function shallowWaterDepthGradient(mayimState, yesodCoordinate) {
	const binahCellSize = Math.max(
		1e-9,
		finiteShallowWaterValue(yesodCoordinate.cellSize, 1)
	);
	const chesedEast = sampleOffsetDepth(mayimState, yesodCoordinate, 1, 0);
	const gevurahWest = sampleOffsetDepth(mayimState, yesodCoordinate, -1, 0);
	const netzachNorth = sampleOffsetDepth(mayimState, yesodCoordinate, 0, 1);
	const hodSouth = sampleOffsetDepth(mayimState, yesodCoordinate, 0, -1);
	const chochmahX = (chesedEast - gevurahWest) / (2 * binahCellSize);
	const binahZ = (netzachNorth - hodSouth) / (2 * binahCellSize);
	return Object.freeze({
		magnitude: Math.hypot(chochmahX, binahZ),
		x: chochmahX,
		z: binahZ
	});
}

/**
 * Bilinearly interpolates the solver's canonical divergence/compression/vorticity definition.
 * @param {object} mayimState Canonical shallow-water state.
 * @param {{x:number,y:number}} yesodCoordinate Floating grid coordinate.
 * @returns {Readonly<object>} Frozen local velocity-derivative evidence.
 */
export function shallowWaterDerivativeEvidence(mayimState, yesodCoordinate) {
	const gevurahWidth = mayimState.height.width;
	const chesedHeight = mayimState.height.height;
	const chochmahX0 = clampShallowWaterValue(
		Math.floor(yesodCoordinate.x),
		0,
		gevurahWidth - 1
	);
	const binahY0 = clampShallowWaterValue(
		Math.floor(yesodCoordinate.y),
		0,
		chesedHeight - 1
	);
	const netzachX1 = Math.min(gevurahWidth - 1, chochmahX0 + 1);
	const hodY1 = Math.min(chesedHeight - 1, binahY0 + 1);
	const tiferesTx = yesodCoordinate.x - chochmahX0;
	const malchusTy = yesodCoordinate.y - binahY0;
	const daasSamples = derivativeSamples(
		mayimState,
		[
			[chochmahX0, binahY0],
			[netzachX1, binahY0],
			[chochmahX0, hodY1],
			[netzachX1, hodY1]
		]
	);
	return Object.freeze({
		compression: bilerpDerivative(daasSamples, 'compression', tiferesTx, malchusTy),
		divergence: bilerpDerivative(daasSamples, 'divergence', tiferesTx, malchusTy),
		vorticity: bilerpDerivative(daasSamples, 'vorticity', tiferesTx, malchusTy)
	});
}

/**
 * Measures the fraction of blocked cardinal neighbors near one lattice coordinate.
 * @param {object} mayimState Canonical shallow-water state.
 * @param {{x:number,y:number}} yesodCoordinate Floating grid coordinate.
 * @returns {number} Bounded zero-through-one obstacle proximity.
 */
export function shallowWaterObstacleProximity(mayimState, yesodCoordinate) {
	const gevurahWidth = mayimState.height.width;
	const chesedHeight = mayimState.height.height;
	const chochmahX = clampShallowWaterValue(
		Math.round(yesodCoordinate.x),
		0,
		gevurahWidth - 1
	);
	const binahY = clampShallowWaterValue(
		Math.round(yesodCoordinate.y),
		0,
		chesedHeight - 1
	);
	const netzachOffsets = [
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1]
	];
	const hodBlocked = netzachOffsets.filter(([chesedDx, gevurahDy]) => {
		const yesodX = clampShallowWaterValue(chochmahX + chesedDx, 0, gevurahWidth - 1);
		const yesodY = clampShallowWaterValue(binahY + gevurahDy, 0, chesedHeight - 1);
		return finiteShallowWaterValue(
			mayimState.obstacles?.values?.[yesodY * gevurahWidth + yesodX],
			0
		) >= 0.5;
	}).length;
	return hodBlocked / netzachOffsets.length;
}

/** Samples one depth value at an integer lattice offset around a floating coordinate. */
function sampleOffsetDepth(mayimState, yesodCoordinate, chesedDx, gevurahDy) {
	return sampleShallowWaterScalar(
		mayimState.height?.values,
		mayimState,
		{
			x: yesodCoordinate.x + chesedDx,
			y: yesodCoordinate.y + gevurahDy
		}
	);
}

/** Evaluates canonical velocity derivatives at four neighboring cell centers. */
function derivativeSamples(mayimState, arbaCoordinates) {
	const gevurahWidth = mayimState.height.width;
	const tiferesHydro = {
		velocityX: mayimState.velocity?.x,
		velocityY: mayimState.velocity?.y
	};
	return arbaCoordinates.map(([chesedCellX, gevurahCellY]) =>
		shallowWaterVelocityDerivatives(
			mayimState,
			tiferesHydro,
			gevurahCellY * gevurahWidth + chesedCellX
		)
	);
}

/** Bilinearly interpolates one named derivative from four canonical samples. */
function bilerpDerivative(arbaSamples, yesodKey, tiferesTx, malchusTy) {
	const chesedSouth = mixShallowWaterValue(
		arbaSamples[0][yesodKey],
		arbaSamples[1][yesodKey],
		tiferesTx
	);
	const gevurahNorth = mixShallowWaterValue(
		arbaSamples[2][yesodKey],
		arbaSamples[3][yesodKey],
		tiferesTx
	);
	return mixShallowWaterValue(chesedSouth, gevurahNorth, malchusTy);
}
