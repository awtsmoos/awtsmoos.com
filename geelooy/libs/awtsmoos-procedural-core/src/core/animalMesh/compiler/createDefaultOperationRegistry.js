// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	AnimalMeshOperationRegistry
} from "./OperationRegistry.js";
import {
	registerGeometryOperationHandlers
} from "./geometryOperationHandlers.js";

export function createDefaultAnimalMeshOperationRegistry() {
	const registry = new AnimalMeshOperationRegistry();
	registerGeometryOperationHandlers(registry);
	registry.register("create_lod", {
		executor: "adapter"
	});
	registry.register("validate_mesh", {
		executor: "core",
		handler: () => null
	});
	return registry;
}
