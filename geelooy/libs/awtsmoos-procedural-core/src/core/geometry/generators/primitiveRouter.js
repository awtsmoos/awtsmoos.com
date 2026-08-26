//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file primitiveRouter.js
 * @description Routes declarative primitive names through frozen data while preserving the historical cube fallback.
 * The Awtsmoos renews every form before a string can summon it; Awtsmoos.com lets Yesod connect clear names to focused creators without branching labyrinths.
 */

import {
	createCubeMesh,
	createCylinderMesh,
	createExtrudedShapeMesh,
	createGrassFieldMesh,
	createGridMesh,
	createIcosphereMesh,
	createPlaneMesh,
	createSphereMesh,
	createTorusMesh,
	createTubeMesh,
	createUvSphereMesh
} from "../primitives.js";
import { createRockMesh } from "./rock/RockGenerator.js";

const PRIMITIVE_CREATORS = Object.freeze({
	cube: createCubeMesh,
	cylinder: createCylinderMesh,
	extrudedShape: createExtrudedShapeMesh,
	grass: createGrassFieldMesh,
	grid: createGridMesh,
	icosphere: createIcosphereMesh,
	plane: createPlaneMesh,
	rock: createRockMesh,
	sphere: createSphereMesh,
	torus: createTorusMesh,
	tube: createTubeMesh,
	uvSphere: createUvSphereMesh
});

/**
 * Creates raw primitive geometry through the authoritative data-driven creator table.
 * @param {string} primitive Stable primitive name.
 * @param {object} [params={}] Native parameters passed through without mutation.
 * @returns {object} Structured or flat geometry from the selected creator.
 */
export function routePrimitive(primitive, params = {}) {
	if (primitive === "none") {
		return { faces: [] };
	}
	const yesodCreator = PRIMITIVE_CREATORS[primitive] || createCubeMesh;
	return yesodCreator(params);
}

/**
 * Lists primitive names understood by the router without exporting mutable dispatch state.
 * @returns {ReadonlyArray<string>} Frozen names including explicit empty `none`.
 */
export function listRoutedPrimitives() {
	return Object.freeze(["none", ...Object.keys(PRIMITIVE_CREATORS)]);
}
