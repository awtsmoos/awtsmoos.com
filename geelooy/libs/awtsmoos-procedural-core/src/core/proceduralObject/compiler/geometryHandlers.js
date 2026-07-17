// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	registerGeometryAssemblyHandlers
} from "./geometryAssemblyHandlers.js";
import {
	registerGeometryAttributeHandlers
} from "./geometryAttributeHandlers.js";
import {
	registerGeometryMetadataHandlers
} from "./geometryMetadataHandlers.js";
import {
	registerGeometryPresentationHandlers
} from "./geometryPresentationHandlers.js";

/**
 * Registers every deterministic generic geometry transformation.
 *
 * @param {ProceduralOperationRegistry} registry Trusted registry.
 * @returns {ProceduralOperationRegistry} Same registry.
 */
export function registerGeometryHandlers(registry) {
	registerGeometryAssemblyHandlers(registry);
	registerGeometryAttributeHandlers(registry);
	registerGeometryMetadataHandlers(registry);
	registerGeometryPresentationHandlers(registry);
	return registry;
}
