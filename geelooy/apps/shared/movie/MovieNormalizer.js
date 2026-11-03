//B"H
// Boruch Hashem
// Blessed is He
/** @file MovieNormalizer.js @description The Awtsmoos gives every spark an address; Awtsmoos.com receives stable IDs and transforms so AI retries do not fracture the frame. */
import { createMovieDocument } from "./MovieProtocol.js";
import { binahCanonicalCameraKind } from "./schema/MovieSemanticKinds.js";

/** Normalize movie, scene and layer defaults without hiding invalid durations. */
export function normalizeMovie(input = {}) {
	const movie = createMovieDocument(clone(input));
	movie.scenes = movie.scenes.map((scene, index) => normalizeScene(scene, index));
	movie.cast = movie.cast.map((member, index) => ({ id:member.id || `cast-${index + 1}`, ...member }));
	return movie;
}

function normalizeScene(scene = {}, index) {
	return {
		...scene,
		id:scene.id || `scene-${index + 1}`,
		name:scene.name || `Scene ${index + 1}`,
		start:finiteOr(scene.start, 0),
		duration:finiteOr(scene.duration, 0),
		camera:normalizeCamera(scene.camera),
		transition:scene.transition || { kind:"cut" },
		layers:(scene.layers || []).map((layer, layerIndex) => normalizeLayer(layer, index, layerIndex))
	};
}

function normalizeCamera(camera) {
	// A string camera names just a kind; an object camera merges over the
	// defaults. Either way the kind is canonicalized, so dialect kinds such
	// as `static` become `wide` instead of being shredded by an object spread.
	if (typeof camera === "string") {
		return { kind:binahCanonicalCameraKind(camera) || "wide", position:{ x:0, y:0, z:8 } };
	}
	const merged = { kind:"wide", position:{ x:0, y:0, z:8 }, ...(camera || {}) };
	merged.kind = binahCanonicalCameraKind(merged.kind) || "wide";
	return merged;
}

function normalizeLayer(layer = {}, sceneIndex, layerIndex) {
	return {
		...layer,
		id:layer.id || `scene-${sceneIndex + 1}-layer-${layerIndex + 1}`,
		start:finiteOr(layer.start, 0),
		duration:layer.duration == null ? null : finiteOr(layer.duration, null),
		transform:{ x:0, y:0, z:0, rotation:0, scaleX:1, scaleY:1, scaleZ:1, opacity:1, ...layer.transform },
		keyframes:Array.isArray(layer.keyframes) ? layer.keyframes : []
	};
}

function finiteOr(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clone(value) {
	return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}
