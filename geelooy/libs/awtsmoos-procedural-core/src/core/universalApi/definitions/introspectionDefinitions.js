// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

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

/** Machine-discoverable API descriptions generated from the method registry. */
export function createIntrospectionDefinitions() {
	return [
		definition("api.describe", (context) => ({
			api: context.executor.apiId,
			methods: context.registry.list(),
			namespaces: context.registry.namespaces()
		})),
		definition("api.namespaces", (context) => context.registry.namespaces()),
		definition("api.methods", (context) => context.registry.list()),
		definition("api.schema", (context, params) => (
			context.registry.describe(params.method).paramsSchema
		)),
		definition("api.capabilities", (context) => ({
			jsonRuntimeParity: true,
			dryRun: true,
			atomicBatch: true,
			undoRedo: true,
			multiDocumentComposition: true,
			runtimeAdapter: Boolean(context.executor.runtimeAdapter),
			methods: context.registry.list().map((method) => ({
				id: method.id,
				stability: method.stability
			}))
		})),
		definition("api.examples", (context, params) => (
			context.registry.describe(params.method).examples ?? []
		))
	];
}
