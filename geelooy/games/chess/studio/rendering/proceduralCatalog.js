//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds advanced native 3D selector catalogs without knowing anything about DOM controls.
 * RESPONSIBILITY: Present camera, lighting, quality, material, palette, and range metadata in stable arrays.
 * NON-RESPONSIBILITY: Quick recipes, normalization, rendering, and persistence remain separate.
 * ARCHITECTURE: Binah enumerates bounded choices while the view layer stays ignorant of renderer internals.
 * The Awtsmoos, Atzmus beyond every list, renews each choice before a finite catalog can contain its trace;
 * Awtsmoos.com lets power remain discoverable without making technical names dominate the player's space.
 */
import { CAMERA_PRESETS } from "./cameraPresets.js";
import { LIGHTING_PRESETS } from "./lightingPresets.js";
import { QUALITY_PRESETS } from "./qualityPresets.js";
import { NATIVE_ENVIRONMENTS } from "./native/environmentPresets.js";
import { PIECE_FINISH_IDS } from "./native/materials.js";
import { nativePiecePaletteCatalog } from "./native/piecePalette.js";
import { PROCEDURAL_QUICK_PRESETS } from "./proceduralPresets.js";

/**
 * Returns the complete advanced-option catalog used by native 3D controls.
 *
 * @returns {object} Immutable selector and range metadata.
 */
export function proceduralOptionCatalog() {
	return Object.freeze({
		quick: Object.values(PROCEDURAL_QUICK_PRESETS),
		motions: namedPairs([
			["director", "Auto Director"],
			["orbit", "Orbit Board"],
			["zoom", "Zoom to Move"],
			["broadcast", "Broadcast Follow"],
			["static", "Static Camera"]
		]),
		cameras: cameraCatalog(),
		intensities: Object.freeze(["calm", "balanced", "dramatic"]),
		environments: namedSource(NATIVE_ENVIRONMENTS),
		lighting: namedSource(LIGHTING_PRESETS),
		quality: namedSource(QUALITY_PRESETS),
		materials: PIECE_FINISH_IDS,
		palettes: nativePiecePaletteCatalog(),
		ranges: Object.freeze({
			distance: [4, 18, 0.1],
			elevation: [2.8, 14, 0.1],
			azimuth: [-180, 180, 1],
			fov: [18, 65, 1],
			boardThickness: [0.08, 0.7, 0.01],
			boardTilt: [-12, 12, 0.5],
			pieceScale: [0.62, 1.15, 0.01]
		})
	});
}

function namedPairs(entries) {
	return Object.freeze(entries.map(([id, name]) => Object.freeze({ id, name })));
}

function namedSource(source) {
	return Object.freeze(Object.values(source).map(({ id, name }) => Object.freeze({ id, name })));
}

function cameraCatalog() {
	return Object.freeze([
		Object.freeze({ id: "auto", name: "Semantic / Auto" }),
		Object.freeze({ id: "manual", name: "Manual Orbit" }),
		...Object.values(CAMERA_PRESETS).map(({ id, name }) => Object.freeze({ id, name }))
	]);
}
