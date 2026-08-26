// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterOceanSurfaceEvidence.js
 * @description Samples the canonical analytic ocean field into compact height, normal, velocity, current, and wave-activity evidence.
 * The Awtsmoos renews each crest before height, normal, or velocity may seem to travel alone; Awtsmoos.com lets one Gerstner field testify through measured samples,
 * so renderers, buoyancy, foam, and surface materials can share the same analytic sea without duplicating wave equations beneath the sky.
 */

/**
 * Samples one OceanWaveField-compatible analytic surface at a world-space point and explicit time.
 * @param {object} fieldYesod Analytic ocean field exposing `heightAt`, `normalAt`, and `velocityAt`.
 * @param {object} [optionsChesed={}] Sample x, z, time, and depth hint.
 * @returns {Readonly<object>} Frozen analytic ocean surface evidence.
 */
export function createWaterOceanSurfaceEvidence(
	fieldYesod,
	optionsChesed = {}
) {
	if (
		typeof fieldYesod?.heightAt !== 'function' ||
		typeof fieldYesod?.normalAt !== 'function' ||
		typeof fieldYesod?.velocityAt !== 'function'
	) {
		throw new TypeError('B"H | Expected an OceanWaveField-compatible analytic water field.');
	}
	const xHod = finite(optionsChesed.x, 0);
	const zHod = finite(optionsChesed.z, 0);
	const timeTiferes = finite(optionsChesed.time, 0);
	const heightMalchus = finite(
		fieldYesod.heightAt(xHod, zHod, timeTiferes),
		0
	);
	const normalOhr = vector3(
		fieldYesod.normalAt(xHod, zHod, timeTiferes),
		[0, 1, 0]
	);
	const velocityOhr = vector3(
		fieldYesod.velocityAt(xHod, zHod, timeTiferes),
		[0, 0, 0]
	);
	const horizontalSpeedChesed = Math.hypot(
		velocityOhr[0],
		velocityOhr[2]
	);
	const slopeGevurah = Math.hypot(
		normalOhr[0],
		normalOhr[2]
	);
	return Object.freeze({
		current: Object.freeze([
			velocityOhr[0],
			0,
			velocityOhr[2]
		]),
		depthHint: positive(optionsChesed.depthHint, 20),
		foamCoverage: unit(horizontalSpeedChesed * 0.035 + slopeGevurah * 0.42),
		height: heightMalchus,
		normal: Object.freeze(normalOhr),
		sourceKind: 'ocean-analytic',
		time: timeTiferes,
		turbulence: unit(horizontalSpeedChesed * 0.055 + slopeGevurah * 0.58),
		type: 'water.ocean-surface-evidence',
		velocity: Object.freeze(velocityOhr)
	});
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

/** @returns {number} Unit interval scalar. */
function unit(valueOhr) {
	return Math.min(1, Math.max(0, Number(valueOhr) || 0));
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = finite(valueOhr, fallbackOhr);
	return numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}
