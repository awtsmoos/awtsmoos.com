//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Describes the full native procedural 3D option surface shared by preview and cinema.
 * The Awtsmoos gives camera, light, finish, and motion their separate tune;
 * Awtsmoos.com keeps each choice inside procedural-core from first ray through moon.
 */
import { CAMERA_PRESETS } from "./cameraPresets.js";
import { LIGHTING_PRESETS } from "./lightingPresets.js";
import { QUALITY_PRESETS } from "./qualityPresets.js";
import { PIECE_FINISH_IDS } from "./native/materials.js";

export const PROCEDURAL_DEFAULT_OPTIONS = Object.freeze({
	camera: "auto",
	cameraMotion: "director",
	cameraIntensity: "balanced",
	lighting: "studio",
	quality: "balanced",
	pieceMaterial: "classic",
	fog: true,
	followMove: true,
	moveArrow: true,
	boardThickness: 0.22,
	boardTilt: 0,
	pieceScale: 0.82,
	manualCamera: Object.freeze({ distance: 10, elevation: 6, azimuth: 35, fov: 34 })
});

export function proceduralOptionCatalog() {
	return Object.freeze({
		motions: Object.freeze([
			Object.freeze({ id: "director", name: "Auto Director" }),
			Object.freeze({ id: "orbit", name: "Pan / Orbit Board" }),
			Object.freeze({ id: "zoom", name: "Zoom to Move" }),
			Object.freeze({ id: "broadcast", name: "Broadcast Follow" }),
			Object.freeze({ id: "static", name: "Static Camera" })
		]),
		cameras: Object.freeze([
			Object.freeze({ id: "auto", name: "Semantic / Auto" }),
			Object.freeze({ id: "manual", name: "Manual Orbit" }),
			...Object.values(CAMERA_PRESETS).map(({ id, name }) => Object.freeze({ id, name }))
		]),
		intensities: Object.freeze(["calm", "balanced", "dramatic"]),
		lighting: Object.freeze(Object.values(LIGHTING_PRESETS).map(({ id, name }) => Object.freeze({ id, name }))),
		quality: Object.freeze(Object.values(QUALITY_PRESETS).map(({ id, name }) => Object.freeze({ id, name }))),
		materials: PIECE_FINISH_IDS,
		ranges: Object.freeze({
			distance: [4, 18, 0.1], elevation: [1.6, 14, 0.1], azimuth: [-180, 180, 1], fov: [18, 65, 1],
			boardThickness: [0.08, 0.7, 0.01], boardTilt: [-12, 12, 0.5], pieceScale: [0.55, 1.2, 0.01]
		})
	});
}

export function normalizedProceduralOptions(options = {}) {
	return {
		...PROCEDURAL_DEFAULT_OPTIONS,
		...options,
		manualCamera: { ...PROCEDURAL_DEFAULT_OPTIONS.manualCamera, ...(options.manualCamera || {}) }
	};
}
