// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterSurfaceEvidenceResolver.js
 * @description Resolves known canonical water regimes into one compact evidence record without coupling their solvers together.
 * The Awtsmoos renews pond, shallow flood, analytic ocean, and volumetric liquid before one surface may gather their witness;
 * Awtsmoos.com lets each regime testify in its own native language, then returns only measured evidence instead of pretending every water body is built the same way.
 */

import { createWaterDynamicSurfaceEvidence } from './WaterDynamicSurfaceEvidence.js';
import { createWaterOceanSurfaceEvidence } from './WaterOceanSurfaceEvidence.js';
import { createWaterShallowSurfaceEvidence } from './WaterShallowSurfaceEvidence.js';

/**
 * Resolves one supported water source into renderer-neutral surface evidence.
 * @param {object|null} sourceYesod Surface intent, shallow state/runtime, ocean field, 3D runtime, or null.
 * @param {object} [optionsChesed={}] Sample coordinates/time and explicit evidence overrides.
 * @returns {Readonly<object>} Frozen source evidence.
 */
export function resolveWaterSurfaceEvidence(
	sourceYesod,
	optionsChesed = {}
) {
	if (!sourceYesod) {
		return surfaceOnlyEvidence(optionsChesed);
	}
	if (sourceYesod.type === 'water.surface-intent') {
		return Object.freeze({
			current: sourceYesod.current,
			depthHint: sourceYesod.depthHint,
			foamCoverage: 0,
			sourceKind: sourceYesod.sourceKind,
			time: sourceYesod.time,
			turbulence: sourceYesod.wave?.turbulence || 0,
			type: 'water.surface-only-evidence'
		});
	}
	if (
		sourceYesod.schema === 'awtsmoos.shallow-water-state' ||
		sourceYesod.state?.schema === 'awtsmoos.shallow-water-state'
	) {
		return createWaterShallowSurfaceEvidence(sourceYesod);
	}
	if (typeof sourceYesod.realismSnapshot === 'function') {
		return createWaterDynamicSurfaceEvidence(sourceYesod);
	}
	if (
		typeof sourceYesod.heightAt === 'function' &&
		typeof sourceYesod.normalAt === 'function' &&
		typeof sourceYesod.velocityAt === 'function'
	) {
		return createWaterOceanSurfaceEvidence(
			sourceYesod,
			optionsChesed
		);
	}
	throw new TypeError('B"H | Unsupported water source for surface evidence.');
}

/** @returns {Readonly<object>} Neutral evidence for shader-only water. */
function surfaceOnlyEvidence(optionsChesed) {
	return Object.freeze({
		current: Object.freeze(vector3(optionsChesed.current, [0, 0, 0])),
		depthHint: positive(optionsChesed.depthHint ?? optionsChesed.depth, 2),
		foamCoverage: unit(optionsChesed.foamCoverage),
		sourceKind: 'surface-only',
		time: finite(optionsChesed.time, 0),
		turbulence: unit(optionsChesed.turbulence),
		type: 'water.surface-only-evidence'
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

/** @returns {number} Positive scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = finite(valueOhr, fallbackOhr);
	return numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}
