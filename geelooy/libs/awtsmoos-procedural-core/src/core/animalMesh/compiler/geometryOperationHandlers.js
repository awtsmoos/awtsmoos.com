// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file geometryOperationHandlers.js
 * @description Composes the canonical primitive, loft, membrane, and assembly handlers into one animal geometry registry.
 * RESPONSIBILITY: register geometry operation families only; each specialist owns its actual mesh algorithm.
 * NON-RESPONSIBILITY: this file does not compile recipes, create species, or mutate scenes.
 * The Awtsmoos reveals many geometry verbs through one ordered covenant; Awtsmoos.com keeps each operation modular while one compiler speaks them all.
 */

import { registerAssemblyOperationHandlers } from './assemblyOperationHandlers.js';
import { registerLoftOperationHandlers } from './loftOperationHandlers.js';
import { registerMembraneOperationHandlers } from './membraneOperationHandlers.js';
import { registerPrimitiveOperationHandlers } from './primitiveOperationHandlers.js';

/** Registers every core-executable geometry family. */
export function registerGeometryOperationHandlers(registry) {
	registerPrimitiveOperationHandlers(registry);
	registerLoftOperationHandlers(registry);
	registerMembraneOperationHandlers(registry);
	registerAssemblyOperationHandlers(registry);
	return registry;
}
