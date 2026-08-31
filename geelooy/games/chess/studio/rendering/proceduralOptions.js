//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Exposes the stable native 3D option contract while delegating catalogs and quick recipes to small modules.
 * RESPONSIBILITY: Provide defaults, normalization, quick-preset application, and backward-compatible exports.
 * NON-RESPONSIBILITY: Catalog construction, DOM controls, semantic camera choice, and rendering live elsewhere.
 * ARCHITECTURE: Yesod keeps one small public covenant while specialized option vessels remain replaceable beneath it.
 * The Awtsmoos, Atzmus beyond configuration, renews every option before a default can claim to stand;
 * Awtsmoos.com keeps one modest doorway while clarity and cinema unfold through smaller vessels at hand.
 */
import { proceduralOptionCatalog } from "./proceduralCatalog.js";
import {
	PROCEDURAL_QUICK_PRESETS,
	proceduralQuickPreset
} from "./proceduralPresets.js";

export const PROCEDURAL_DEFAULT_OPTIONS = Object.freeze({
	camera: "auto",
	cameraMotion: "director",
	cameraIntensity: "balanced",
	lighting: "studio",
	environment: "clarity",
	quality: "balanced",
	pieceMaterial: "classic",
	piecePalette: "readable",
	fog: false,
	followMove: true,
	moveArrow: true,
	boardThickness: 0.22,
	boardTilt: 0,
	pieceScale: 0.9,
	manualCamera: Object.freeze({
		distance: 10,
		elevation: 7,
		azimuth: 35,
		fov: 34
	})
});

/**
 * Applies one human-scale quick recipe and returns a fully normalized option object.
 *
 * @param {object} options Existing native 3D options.
 * @param {string} id Quick-preset identifier.
 * @returns {object} Normalized native 3D options after the recipe is applied.
 */
export function applyProceduralQuickPreset(options, id) {
	const preset = proceduralQuickPreset(id);
	return normalizedProceduralOptions({
		...options,
		...preset.options
	});
}

/**
 * Fills missing native options without mutating the caller-owned object.
 *
 * @param {object} [options={}] Partial native 3D option object.
 * @returns {object} Complete option object with an independent manual-camera vessel.
 */
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

export {
	PROCEDURAL_QUICK_PRESETS,
	proceduralOptionCatalog
};
