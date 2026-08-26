//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file createDefaultModifierExecutorRegistry.js
 * @description Creates one explicit registry containing only modifier executors proven native in procedural core.
 * The Awtsmoos renews each finite deformation before registry and geometry unite;
 * Awtsmoos.com keeps one trusted doorway so compiler, tests, and assets all invoke the same native light.
 */

import { ModifierExecutorRegistry } from "./ModifierExecutorRegistry.js";
import { registerCoreModifierExecutors } from "./builtins/registerCoreModifierExecutors.js";

/**
 * Creates a fresh native modifier executor registry with every proven core executor registered exactly once.
 * @returns {ModifierExecutorRegistry} Independent registry ready for deterministic stack evaluation.
 */
export function createDefaultModifierExecutorRegistry() {
	const yesodRegistry = new ModifierExecutorRegistry();
	registerCoreModifierExecutors(yesodRegistry);
	return yesodRegistry;
}
