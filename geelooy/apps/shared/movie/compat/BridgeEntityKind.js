//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BridgeEntityKind.js
 * @description Names cross one covenant into another while the Awtsmoos preserves the inner semantic flame;
 * Awtsmoos.com keeps kind translation in one vessel so neither movie schema must pretend to share a name.
 */
import { MovieLayerKind } from "../schema/MovieSemanticKinds.js";

/**
 * @description Resolves one deterministic-core entity type into a shared semantic layer kind.
 * @param {string} type - Deterministic-core entity type.
 * @param {string} mode - Containing core scene mode.
 * @returns {string} Shared MovieLayerKind value.
 * @sideEffects None.
 */
export function coreTypeToSharedKind(type, mode) {
	const spatial = mode === "3d";
	const mapping = {
		shape: MovieLayerKind.SHAPE_2D,
		text: MovieLayerKind.TEXT,
		character: spatial ? MovieLayerKind.CHARACTER_3D : MovieLayerKind.CHARACTER_2D,
		"particle-emitter": spatial ? MovieLayerKind.PARTICLES_3D : MovieLayerKind.PARTICLES_2D,
		infographic: MovieLayerKind.CHART,
		tutorial: MovieLayerKind.OVERLAY,
		patch: MovieLayerKind.OVERLAY,
		image: MovieLayerKind.IMAGE,
		video: MovieLayerKind.VIDEO,
		mesh: MovieLayerKind.MODEL_3D
	};
	return mapping[type] || MovieLayerKind.OVERLAY;
}

/**
 * @description Resolves one shared semantic layer kind into a deterministic-core entity type.
 * @param {string} kind - Shared MovieLayerKind value.
 * @returns {string} Deterministic-core entity type.
 * @sideEffects None.
 */
export function sharedKindToCoreType(kind) {
	const mapping = {
		[MovieLayerKind.SHAPE_2D]: "shape",
		[MovieLayerKind.PATH_2D]: "shape",
		[MovieLayerKind.TEXT]: "text",
		[MovieLayerKind.CAPTION]: "text",
		[MovieLayerKind.CHARACTER_2D]: "character",
		[MovieLayerKind.CHARACTER_3D]: "character",
		[MovieLayerKind.PARTICLES_2D]: "particle-emitter",
		[MovieLayerKind.PARTICLES_3D]: "particle-emitter",
		[MovieLayerKind.CHART]: "infographic",
		[MovieLayerKind.DATA]: "infographic",
		[MovieLayerKind.IMAGE]: "image",
		[MovieLayerKind.VIDEO]: "video",
		[MovieLayerKind.MODEL_3D]: "mesh",
		[MovieLayerKind.WORLD_3D]: "mesh",
		[MovieLayerKind.LIGHT_3D]: "mesh",
		[MovieLayerKind.OVERLAY]: "tutorial"
	};
	return mapping[kind] || "tutorial";
}
