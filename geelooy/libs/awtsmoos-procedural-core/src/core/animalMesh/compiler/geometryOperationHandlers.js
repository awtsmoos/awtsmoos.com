// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	registerAssemblyOperationHandlers
} from "./assemblyOperationHandlers.js";
import {
	registerLoftOperationHandlers
} from "./loftOperationHandlers.js";
import {
	registerPrimitiveOperationHandlers
} from "./primitiveOperationHandlers.js";

export function registerGeometryOperationHandlers(registry) {
	registerPrimitiveOperationHandlers(registry);
	registerLoftOperationHandlers(registry);
	registerAssemblyOperationHandlers(registry);
	return registry;
}
