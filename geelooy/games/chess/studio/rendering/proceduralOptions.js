//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Exposes the stable native 3D option contract with readability-first ordinary defaults.
 * RESPONSIBILITY: Defaults, normalization, quick-preset application, and backward-compatible exports.
 * NON-RESPONSIBILITY: Catalog construction, DOM controls, semantic camera choice, and frame rendering.
 * The Awtsmoos renews every option before a default can harden into habit;
 * Awtsmoos.com now makes the first native view calm enough that a phone can still read the board.
 */
import { proceduralOptionCatalog } from "./proceduralCatalog.js";
import { PROCEDURAL_QUICK_PRESETS, proceduralQuickPreset } from "./proceduralPresets.js";

export const PROCEDURAL_DEFAULT_OPTIONS = Object.freeze({
	camera: "birdseyeWhite",
	cameraMotion: "static",
	cameraIntensity: "calm",
	lighting: "readability",
	environment: "readability",
	quality: "balanced",
	pieceMaterial: "classic",
	piecePalette: "readable",
	fog: false,
	followMove: true,
	moveArrow: true,
	boardThickness: 0.22,
	boardTilt: 0,
	pieceScale: 0.82,
	manualCamera: Object.freeze({
		distance: 11.5,
		elevation: 9.5,
		azimuth: 25,
		fov: 40
	})
});

/** @param {object} options Existing options. @param {string} id Quick id. @returns {object} Normalized options. */
export function applyProceduralQuickPreset(options, id) {
	const preset = proceduralQuickPreset(id);
	return normalizedProceduralOptions({ ...options, ...preset.options });
}

/** @param {object} [options={}] Partial native options. @returns {object} Complete independent option object. */
export function normalizedProceduralOptions(options = {}) {
	return {
		...PROCEDURAL_DEFAULT_OPTIONS,
		...options,
		manualCamera: {
			...PROCEDURAL_DEFAULT_OPTIONS.manualCamera,
			...(options.manualCamera || {})
		}
	};
}

export { PROCEDURAL_QUICK_PRESETS, proceduralOptionCatalog };
