// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterSurfaceSnapshot.js
 * @description Composes compact source evidence with one canonical WaterSurfaceIntent for simulation-free, shallow, analytic-ocean, or volumetric water.
 * The Awtsmoos renews hidden depth and visible surface before a snapshot can call them one artifact; Awtsmoos.com lets Tiferes join measured motion with optical intent,
 * so renderers and gameplay receive a small truthful covenant while every specialist solver remains free beneath the reflected light.
 */

import { resolveWaterSurfaceEvidence } from './WaterSurfaceEvidenceResolver.js';
import { createWaterSurfaceIntent } from './WaterSurfaceIntent.js';

/**
 * Creates one immutable renderer-neutral water surface snapshot from any supported canonical source.
 * @param {object|null} [sourceYesod=null] Surface intent, shallow state/runtime, analytic ocean field, 3D runtime, or null.
 * @param {object} [optionsChesed={}] Material, sampling, optics, wave, current, depth, normal-detail, and texture overrides.
 * @returns {Readonly<object>} Frozen surface intent plus measured source evidence.
 */
export function createWaterSurfaceSnapshot(
	sourceYesod = null,
	optionsChesed = {}
) {
	const evidenceBinah = resolveWaterSurfaceEvidence(
		sourceYesod,
		optionsChesed
	);
	const sourceIntentBinah = sourceYesod?.type === 'water.surface-intent'
		? sourceYesod
		: null;
	const intentBinah = sourceIntentBinah || createWaterSurfaceIntent({
		...optionsChesed,
		current: optionsChesed.current ?? evidenceBinah.current,
		depthHint: optionsChesed.depthHint ??
			evidenceBinah.depthHint ??
			evidenceBinah.meanDepth,
		material: optionsChesed.material ||
			evidenceBinah.material ||
			materialForSource(evidenceBinah.sourceKind),
		optics: {
			...(evidenceBinah.optics || {}),
			...(optionsChesed.optics || {})
		},
		preset: optionsChesed.preset || presetForSource(evidenceBinah.sourceKind),
		sourceKind: evidenceBinah.sourceKind,
		time: optionsChesed.time ?? evidenceBinah.time ?? 0,
		wave: {
			...(optionsChesed.wave || {}),
			turbulence: optionsChesed.wave?.turbulence ??
				evidenceBinah.turbulence
		}
	});
	return Object.freeze({
		evidence: evidenceBinah,
		intent: intentBinah,
		sourceKind: evidenceBinah.sourceKind,
		time: intentBinah.time,
		type: 'water.surface-snapshot'
	});
}

/** @returns {string} Canonical material family for a source regime. */
function materialForSource(sourceKindHod) {
	if (sourceKindHod === 'ocean-analytic') {
		return 'ocean';
	}
	if (sourceKindHod === 'shallow') {
		return 'fresh';
	}
	return 'fresh';
}

/** @returns {string} Surface motion preset for a source regime. */
function presetForSource(sourceKindHod) {
	if (sourceKindHod === 'ocean-analytic') {
		return 'ocean';
	}
	if (sourceKindHod === 'shallow') {
		return 'river';
	}
	if (sourceKindHod === 'fluid-3d') {
		return 'pond';
	}
	return 'still';
}
