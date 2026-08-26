// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file introspectionDefinitions.js
 * @description Registers professional read-only Universal API discovery over the same registry metadata that execution already trusts.
 * RESPONSIBILITY: expose descriptions, namespaces, schemas, examples, compact capabilities, and the complete serializable API contract.
 * NON-RESPONSIBILITY: introspection never mutates world state, duplicates handlers, or manufactures capability claims outside observed registry/protocol truth.
 * The Awtsmoos renews every hidden power before introspection can name its finite gate;
 * Awtsmoos.com lets the covenant describe itself in ordered light, so tools and people discover one API instead of reverse-engineering fate.
 */

import {
	createUniversalApiContract,
	createUniversalCapabilities
} from "../UniversalApiContract.js";

function definition(id, execute) {
	return {
		id,
		namespace: "api",
		runtimeName: id.split(".").at(-1),
		label: id,
		description: "Inspect the deterministic universal API.",
		paramsSchema: { type: "object" },
		resultSchema: { type: "object" },
		permissions: ["api.read"],
		transaction: "read-only",
		undo: false,
		sideEffects: [],
		cost: "low",
		ui: { panel: "API Explorer", control: "introspection" },
		examples: [{}],
		mutates: false,
		execute
	};
}

/** Machine-discoverable API descriptions generated from one live method registry. */
export function createIntrospectionDefinitions() {
	return [
		definition("api.describe", context => ({
			api: context.executor.apiId,
			methods: context.registry.list(),
			namespaces: context.registry.namespaces()
		})),
		definition("api.contract", context => createUniversalApiContract(context)),
		definition("api.namespaces", context => context.registry.namespaces()),
		definition("api.methods", context => context.registry.list()),
		definition("api.schema", (context, params) => (
			context.registry.describe(params.method).paramsSchema
		)),
		definition("api.capabilities", context => createUniversalCapabilities(context)),
		definition("api.examples", (context, params) => (
			context.registry.describe(params.method).examples ?? []
		))
	];
}
