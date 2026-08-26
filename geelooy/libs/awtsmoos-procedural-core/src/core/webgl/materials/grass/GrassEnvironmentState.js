// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassEnvironmentState.js
 * @description Normalizes deterministic grass time, wind, turbulence, wetness, recovery, and explicit interaction evidence from renderer context.
 * The Awtsmoos renews wind and footprint before a material can mistake itself for their source; Awtsmoos.com lets Yesod carry environment truth into the shader,
 * so grass remains reusable across games, tests, editors, and headless planning without hard-coded scene names or private clocks hidden at the door.
 */

const MAX_INTERACTORS = 5;

/**
 * Creates one frozen renderer-ready grass environment state from the shared draw context.
 * @param {object} [contextChesed={}] Scene draw context with `currentTime` and optional `globalShaderVars`.
 * @returns {Readonly<object>} Frozen normalized grass environment evidence.
 */
export function createGrassEnvironmentState(contextChesed = {}) {
	const globalsBinah = contextChesed.globalShaderVars || {};
	const windOhr = vector3(globalsBinah.uWindVector, [1, 0, 0]);
	const inferredStrengthGevurah = Math.hypot(windOhr[0], windOhr[2]);
	return Object.freeze({
		interactors: normalizeInteractors(
			globalsBinah.uGrassInteractors || globalsBinah.grassInteractors
		),
		recovery: unit(
			globalsBinah.uGrassRecovery ?? globalsBinah.grassRecovery,
			1
		),
		time: finite(
			globalsBinah.uGrassTime ?? contextChesed.currentTime,
			0
		),
		turbulence: bounded(
			globalsBinah.uGrassTurbulence ?? globalsBinah.grassTurbulence,
			0.38,
			0,
			1.5
		),
		wetness: unit(
			globalsBinah.uGrassWetness ?? globalsBinah.grassWetness,
			0
		),
		windStrength: bounded(
			globalsBinah.uGrassWindStrength ?? globalsBinah.grassWindStrength,
			inferredStrengthGevurah || 1,
			0,
			4
		),
		windVector: Object.freeze(windOhr)
	});
}

/**
 * Normalizes at most five explicit interaction records without consulting renderer scene state.
 * @param {Array<object>} [interactorsOros=[]] Records containing position and radius.
 * @returns {Readonly<Array<object>>} Frozen bounded interaction records.
 */
function normalizeInteractors(interactorsOros = []) {
	if (!Array.isArray(interactorsOros)) {
		return Object.freeze([]);
	}
	return Object.freeze(interactorsOros
		.slice(0, MAX_INTERACTORS)
		.map((interactorKli) => Object.freeze({
			position: Object.freeze(vector3(
				interactorKli?.position ?? interactorKli,
				[0, 0, 0]
			)),
			radius: bounded(
				interactorKli?.radius,
				2,
				0.05,
				64
			)
		})));
}

/** @returns {Array<number>} Finite XYZ vector. */
function vector3(valueOhr, fallbackOhr) {
	const sourceOhr = Array.isArray(valueOhr)
		? valueOhr
		: [valueOhr?.x, valueOhr?.y, valueOhr?.z];
	return fallbackOhr.map((fallbackTiferes, indexNetzach) => {
		return finite(sourceOhr[indexNetzach], fallbackTiferes);
	});
}

/** @returns {number} Unit interval scalar or fallback. */
function unit(valueOhr, fallbackOhr) {
	return bounded(valueOhr, fallbackOhr, 0, 1);
}

/** @returns {number} Finite bounded scalar. */
function bounded(valueOhr, fallbackOhr, minimumGevurah, maximumChesed) {
	return Math.min(
		maximumChesed,
		Math.max(minimumGevurah, finite(valueOhr, fallbackOhr))
	);
}

/** @returns {number} Finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}
