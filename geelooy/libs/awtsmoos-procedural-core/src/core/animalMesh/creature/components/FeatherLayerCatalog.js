// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FeatherLayerCatalog.js
 * @description Names reusable avian feather tracts as canonical covering profiles without owning feather geometry or species presets.
 * RESPONSIBILITY: provide immutable down, contour, flight, covert, tail, display, crest, facial, and neck covering profiles with caller overrides.
 * NON-RESPONSIBILITY: this catalog does not place feathers, build shafts or vanes, choose a bird species, animate flutter, or allocate renderer instances.
 * The Awtsmoos renews each feather while no bird may own the law of featherhood; Awtsmoos.com lets tract and vane become reusable vessels so wing, wall, horn, or stranger form may wear the same ordered light.
 */

import { createCoveringLayerProfile } from './CoveringLayerProfile.js';

const FEATHER_LAYER_DEFAULTS = Object.freeze({
	down: profile('body.down', 0.92, 0.028, 0.022, 0.3, 2600),
	contour: profile('body.contour', 0.78, 0.085, 0.032, 0.18, 2400),
	primary: profile('wing.primary', 0.82, 0.46, 0.105, 0.05, 720),
	secondary: profile('wing.secondary', 0.86, 0.34, 0.11, 0.07, 900),
	covert: profile('wing.coverts', 0.8, 0.16, 0.075, 0.12, 1300),
	tail: profile('tail', 0.84, 0.52, 0.13, 0.06, 640),
	display: profile('display', 0.72, 0.62, 0.18, 0.09, 720),
	crest: profile('head.crest', 0.62, 0.22, 0.055, 0.16, 360),
	facial: profile('face', 0.76, 0.048, 0.024, 0.22, 680),
	neck: profile('neck', 0.8, 0.075, 0.03, 0.2, 1100)
});

/**
 * Creates all canonical feather-layer profiles with optional shared and per-layer overrides.
 * @param {object} [options={}] Shared material/shading plus `layers` keyed by feather-layer id.
 * @returns {Readonly<Record<string, object>>} Frozen map of canonical covering profiles.
 */
export function createFeatherLayerCatalog(options = {}) {
	const layerOverrides = options.layers || {};
	return Object.freeze(Object.fromEntries(
		listFeatherLayerIds().map(id => [
			id,
			createFeatherLayerProfile(id, {
				material: options.material,
				shading: options.shading,
				...(layerOverrides[id] || {})
			})
		])
	));
}

/**
 * Creates one canonical feather covering profile by tract/layer id.
 * @param {string} id Feather layer id from `listFeatherLayerIds()`.
 * @param {object} [overrides={}] Covering-profile overrides.
 * @returns {object} Frozen `CoveringLayerProfile`.
 */
export function createFeatherLayerProfile(id, overrides = {}) {
	const defaults = FEATHER_LAYER_DEFAULTS[String(id || '').trim()];
	if (!defaults) {
		throw new RangeError(`B"H | Unsupported feather layer "${id}".`);
	}
	return createCoveringLayerProfile({
		...defaults,
		...overrides,
		material: { ...(defaults.material || {}), ...(overrides.material || {}) },
		shading: { ...(defaults.shading || {}), ...(overrides.shading || {}) },
		type: 'feather_field'
	});
}

/** Lists stable feather-layer ids for schemas, editors, and species grammars. */
export function listFeatherLayerIds() {
	return Object.freeze(Object.keys(FEATHER_LAYER_DEFAULTS));
}

/** Creates one concise default record consumed later by `CoveringLayerProfile`. */
function profile(region, density, length, width, clumping, maxInstances) {
	return Object.freeze({
		clumping,
		density,
		lay: [0, 0, 1],
		length,
		maxInstances,
		region,
		width
	});
}
