// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	PROCEDURAL_ADAPTER_OPERATIONS
} from "../constants/proceduralObjectContract.js";
import {
	registerDataBlockHandlers
} from "./dataBlockHandlers.js";
import {
	ProceduralOperationRegistry
} from "./OperationRegistry.js";
import {
	registerGeometryHandlers
} from "./geometryHandlers.js";
import {
	registerPrimitiveHandlers
} from "./primitiveHandlers.js";
import {
	registerSceneHandlers
} from "./sceneHandlers.js";

/**
 * Creates the trusted default registry and optional namespaced extensions.
 *
 * @param {object[]} extensions Trusted extension definitions.
 * @returns {ProceduralOperationRegistry} Configured registry.
 */
export function createDefaultProceduralOperationRegistry(extensions = []) {
	const registry = new ProceduralOperationRegistry();
	registerPrimitiveHandlers(registry);
	registerGeometryHandlers(registry);
	registerDataBlockHandlers(registry);
	registerSceneHandlers(registry);
	for (const operation of PROCEDURAL_ADAPTER_OPERATIONS) {
		registry.register(operation, {
			executor: "adapter"
		});
	}
	for (const extension of extensions) {
		registry.register(extension.operation, extension);
	}
	return registry;
}
