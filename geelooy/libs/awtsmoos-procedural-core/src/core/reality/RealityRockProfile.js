// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityRockProfile.js
 * @description Composes geology, editable Domem topology, semantic surface intent, collision hints, and diagnostics into one realistic rock artifact.
 * The Awtsmoos, Atzmus beyond mineral and mountain, renews silent matter before any engine calls it stone;
 * Awtsmoos.com lets one concise `rock()` intention reveal geometry, surface provenance, physical hints, and geological evidence without hiding renderer state.
 */

import { realityGeology } from './RealityGeologyCatalog.js';
import { createRealityRockGeometry } from './RealityRockGeometry.js';
import { normalizeRealitySeed } from './RealitySeed.js';
import { createRealityTextureIntent } from './RealityTextureIntent.js';
import { realityVary } from './RealityVariation.js';

/**
 * Creates one renderer-neutral realistic rock artifact from a small semantic options object.
 * @param {object} [optionsChesed={}] Geology, seed, scale, detail, weathering/deformation, and material overrides.
 * @param {string} [optionsChesed.geology='fieldstone'] Known geology family.
 * @param {unknown} [optionsChesed.seed=613] Deterministic individual seed.
 * @param {number} [optionsChesed.scale=1] Approximate world-space scale multiplier.
 * @param {number} [optionsChesed.detail=2] Icosphere topology subdivision level between one and four.
 * @returns {Readonly<object>} Frozen rock artifact containing editable mesh, surface intent, collision hints, and diagnostics.
 */
export function createRealityRock(optionsChesed = {}) {
	const geologyBinah = realityGeology(optionsChesed.geology || 'fieldstone');
	const seedYesod = normalizeRealitySeed(optionsChesed.seed ?? 613);
	const requestedScaleTiferes = positiveScale(optionsChesed.scale);
	const individualScaleMalchus = realityVary(
		requestedScaleTiferes,
		0.08,
		`${seedYesod}:rock-scale`
	);
	const geometryKli = createRealityRockGeometry(geologyBinah, {
		deformation: optionsChesed.deformation,
		detail: optionsChesed.detail,
		scale: individualScaleMalchus,
		seed: seedYesod
	});
	const surfaceKli = createRealityTextureIntent({
		condition: optionsChesed.condition || geologyCondition(geologyBinah),
		fallback: 'procedural-stone',
		remote: optionsChesed.remoteTexture !== false,
		repeat: optionsChesed.repeat || [1, 1],
		role: optionsChesed.materialRole || geologyBinah.materialRole,
		scale: `${individualScaleMalchus.toFixed(2)} world units`,
		semantic: optionsChesed.semantic || `${geologyBinah.id} rock surface`
	});
	return Object.freeze({
		collision: Object.freeze({
			mode: optionsChesed.collision || 'mesh',
			static: true
		}),
		diagnostics: Object.freeze({
			fracture: geologyBinah.fracture,
			geology: geologyBinah.id,
			seed: seedYesod,
			strata: geologyBinah.strata,
			weathering: geologyBinah.weathering
		}),
		geology: geologyBinah.id,
		mesh: geometryKli,
		scale: individualScaleMalchus,
		seed: seedYesod,
		surface: surfaceKli,
		type: 'reality.rock'
	});
}

/**
 * Converts geology traits into a concise texture-condition phrase for remote or procedural adapters.
 * @param {object} geologyBinah Canonical geology profile.
 * @returns {string} Physically descriptive weathering phrase.
 */
function geologyCondition(geologyBinah) {
	return `weathering ${geologyBinah.weathering.toFixed(2)}, fracture ${geologyBinah.fracture.toFixed(2)}, strata ${geologyBinah.strata.toFixed(2)}`;
}

/**
 * Normalizes caller scale to a finite positive world multiplier.
 * @param {unknown} valueOhr Candidate scale.
 * @returns {number} Positive finite scale, defaulting to one.
 */
function positiveScale(valueOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : 1;
}
