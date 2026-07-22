// B"H
// Boruch Hashem
// Blessed is He
/** Blender representation and native contracts share one inspectable registry. */

import { NodeDefinitionRegistry } from "../NodeDefinitionRegistry.js";
import { createBlenderBuiltinSchemaPack } from "../blender/index.js";
import { createNativeBlenderParityMatrix } from "./createNativeBlenderParityMatrix.js";
import { createNativeNodeSchemaPack } from "./createNativeNodeSchemaPack.js";
import { planOpenNodeConnection } from "./planOpenNodeConnection.js";

function categories(definitions) {
	const result = {};
	for (const definition of definitions) {
		const category = definition.metadata?.category ?? "uncategorized";
		(result[category] ??= []).push(definition.type);
	}
	return Object.freeze(Object.fromEntries(
		Object.entries(result).map(([name, values]) => [
			name,
			Object.freeze(values.sort())
		])
	));
}

/**
 * Opens all built-in Blender manifest contracts beside native implementations.
 * @param {Object} options - Blender version and optional executor registry.
 * @returns {Object} Registry, manifests, definitions, planners, and parity.
 */
export function createOpenBlenderNodeApiSurface(options = {}) {
	const blenderSchemaPack = createBlenderBuiltinSchemaPack(options);
	const blenderManifest = blenderSchemaPack.manifest;
	const blenderPack = blenderSchemaPack.nodeSchemaPack;
	const nativePack = createNativeNodeSchemaPack();
	const registry = new NodeDefinitionRegistry()
		.registerPack(blenderPack)
		.registerPack(nativePack);
	const definitions = registry.list();
	const surface = Object.freeze({
		schema: "awtsmoos.open-blender-node-api",
		version: "1.0.0",
		blenderVersion: blenderManifest.blenderVersion,
		blenderManifest,
		blenderSchemaPack,
		blenderPack,
		nativePack,
		registry,
		definitions,
		modifierDefinitions: blenderSchemaPack.modifierDefinitions,
		interfaces: blenderSchemaPack.interfaces,
		zones: blenderSchemaPack.zones,
		aliases: blenderSchemaPack.aliases,
		categories: categories(definitions),
		counts: Object.freeze({
			blender: blenderPack.definitions.length,
			native: nativePack.definitions.length,
			total: registry.size,
			modifiers: blenderSchemaPack.modifierDefinitions.length,
			zones: blenderSchemaPack.zones.length
		})
	});
	return Object.freeze({
		...surface,
		planConnection: (input) => planOpenNodeConnection(surface, input),
		createParityMatrix: (input = {}) => createNativeBlenderParityMatrix(
			surface,
			{ executorRegistry: options.executorRegistry, ...input }
		)
	});
}
