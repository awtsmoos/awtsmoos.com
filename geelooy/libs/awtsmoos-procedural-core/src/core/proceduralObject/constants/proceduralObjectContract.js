// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	PROCEDURAL_ADAPTER_OPERATIONS,
	PROCEDURAL_MODELING_OPERATIONS,
	PROCEDURAL_OUTPUT_OPERATIONS,
	PROCEDURAL_SIMULATION_OPERATIONS,
	PROCEDURAL_SURFACE_OPERATIONS
} from "./adapterOperationCatalog.js";
import {
	PROCEDURAL_CORE_GEOMETRY_OPERATIONS,
	PROCEDURAL_CORE_OPERATIONS,
	PROCEDURAL_CORE_SCENE_OPERATIONS
} from "./coreOperationCatalog.js";

export const PROCEDURAL_OBJECT_SCHEMA = "awtsmoos.procedural-object-recipe";
export const PROCEDURAL_OBJECT_PATCH_SCHEMA = "awtsmoos.procedural-object-recipe-patch";
export const PROCEDURAL_OBJECT_ARTIFACT_SCHEMA = "awtsmoos.procedural-object-artifact";
export const PROCEDURAL_OBJECT_SCHEMA_VERSION = "1.0.0";

export const PROCEDURAL_TOPOLOGY_MODES = Object.freeze([
	"triangles",
	"triangle_strip",
	"triangle_fan",
	"lines",
	"line_strip",
	"line_loop",
	"points"
]);

export const PROCEDURAL_COMPONENT_TYPES = Object.freeze([
	"float32",
	"float64",
	"int8",
	"uint8",
	"int16",
	"uint16",
	"int32",
	"uint32"
]);

export const PROCEDURAL_OBJECT_LIMITS = Object.freeze({
	maximumAbsoluteCoordinate: 1000000,
	maximumCommands: 4096,
	maximumObjects: 4096,
	maximumDataBlocks: 8192,
	maximumLinks: 32768,
	maximumGeometries: 2048,
	maximumAttributesPerGeometry: 64,
	maximumAttributeValues: 20000000,
	maximumIndices: 30000000,
	maximumDependencies: 128,
	maximumMorphTargets: 128,
	maximumBones: 1024,
	maximumAnimationTracks: 4096
});

export {
	PROCEDURAL_ADAPTER_OPERATIONS,
	PROCEDURAL_CORE_GEOMETRY_OPERATIONS,
	PROCEDURAL_CORE_OPERATIONS,
	PROCEDURAL_CORE_SCENE_OPERATIONS,
	PROCEDURAL_MODELING_OPERATIONS,
	PROCEDURAL_OUTPUT_OPERATIONS,
	PROCEDURAL_SIMULATION_OPERATIONS,
	PROCEDURAL_SURFACE_OPERATIONS
};

export const PROCEDURAL_OBJECT_OPERATIONS = Object.freeze([
	...PROCEDURAL_CORE_OPERATIONS,
	...PROCEDURAL_ADAPTER_OPERATIONS
]);

/**
 * Checks built-in or safely namespaced trusted extension operations.
 *
 * @param {string} operation Operation name.
 * @returns {boolean} Whether its syntax belongs to the language.
 */
export function isProceduralOperationName(operation) {
	return (
		PROCEDURAL_OBJECT_OPERATIONS.includes(operation)
		|| /^ext:[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i.test(
			operation || ""
		)
	);
}
