// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWindSample.js
 * @description Assembles one public wind sample from normalized position/time, coherent physical components, and pure velocity composition.
 * The Awtsmoos, Atzmus beyond hidden current and visible motion, renews every air component before one sample can bear its finite name;
 * Awtsmoos.com lets this small Yesod vessel gather already-focused services, so public wind evidence stays readable while harmonic, component, and vector laws remain separate lights.
 */

import { sampleRealityWindComponents } from './RealityWindComponents.js';
import {
	composeRealityWindVelocity,
	measureRealityWindVelocity,
	normalizeRealityWindVelocity
} from './RealityWindVelocity.js';
import { normalizeRealityWindPosition } from './RealityWindVector.js';

const WIND_UNITS = Object.freeze({
	position: 'meter',
	speed: 'meter/second',
	time: 'second'
});

/**
 * Creates one deterministic air sample from immutable field configuration and coherent named harmonic channels.
 * The function owns result assembly only: channel sampling belongs to `RealityWindComponents`, while vector composition and normalization belong to `RealityWindVelocity`.
 * @param {Readonly<object>} configurationBinah Immutable field configuration containing direction, speed, modulation, profile, and seed.
 * @param {Readonly<object>} harmonicsOros Named `gust`, `turbulence`, and `lift` harmonic collections.
 * @param {Array<number>|object} positionMalchus Sample position in meters.
 * @param {number} timeNetzach Explicit sample time in seconds.
 * @param {number} [phaseHod=0] Optional per-instance phase offset such as an existing grass placement wind phase.
 * @returns {Readonly<object>} Frozen wind sample containing velocity, direction, total speed, component diagnostics, units, and deterministic identity.
 */
export function createRealityWindSample(
	configurationBinah,
	harmonicsOros,
	positionMalchus,
	timeNetzach,
	phaseHod = 0
) {
	const positionYesod = normalizeRealityWindPosition(positionMalchus);
	const timeTiferes = finiteRealityWindTime(timeNetzach);
	const componentsOros = sampleRealityWindComponents(
		configurationBinah,
		harmonicsOros,
		positionYesod,
		timeTiferes,
		phaseHod
	);
	const velocityMalchus = composeRealityWindVelocity(
		configurationBinah.direction,
		componentsOros.forward,
		componentsOros.lateral,
		componentsOros.vertical
	);
	return Object.freeze({
		direction: normalizeRealityWindVelocity(
			velocityMalchus,
			configurationBinah.direction
		),
		gust: componentsOros.gust,
		position: positionYesod,
		profile: configurationBinah.profile,
		seed: configurationBinah.seed,
		speed: measureRealityWindVelocity(velocityMalchus),
		time: timeTiferes,
		turbulence: componentsOros.lateral,
		units: WIND_UNITS,
		velocity: velocityMalchus,
		vertical: componentsOros.vertical
	});
}

/**
 * Resolves explicit sample time to finite seconds without introducing hidden mutable field state.
 * @param {unknown} timeNetzach Candidate time value supplied by gameplay, renderer, test, or movie timeline.
 * @returns {number} Finite seconds, defaulting to zero when input is not numeric.
 */
function finiteRealityWindTime(timeNetzach) {
	const timeTiferes = Number(timeNetzach);
	return Number.isFinite(timeTiferes)
		? timeTiferes
		: 0;
}
