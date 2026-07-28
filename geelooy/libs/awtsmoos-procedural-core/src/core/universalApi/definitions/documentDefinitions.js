// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { composeWorldDocuments } from "../compose.js";
import { createResource } from "../resourceOperations.js";

function definition(id, label, mutates, execute) {
	return {
		id,
		namespace: id.split(".")[0],
		runtimeName: id.split(".").at(-1),
		label,
		description: label,
		paramsSchema: { type: "object" },
		resultSchema: { type: "object" },
		permissions: [mutates ? "world.write" : "world.read"],
		transaction: mutates ? "atomic" : "read-only",
		undo: mutates,
		sideEffects: mutates ? ["document", "runtime", "ui"] : [],
		cost: "medium",
		ui: { panel: id.startsWith("plugins") ? "Plugins" : "Documents", control: "form" },
		examples: [{}],
		stability: "experimental",
		mutates,
		execute
	};
}

/** Composition and plugin extension definitions. */
export function createDocumentDefinitions() {
	return [
		definition("documents.compose", "Compose imported world documents.", true, async (context, params) => {
			const composed = await composeWorldDocuments(params.document, {
				resolveImport: context.executor.importResolver
			});
			Object.assign(context.document, composed);
			context.updated.push("world:document");
			return { revision: composed.revision };
		}),
		definition("plugins.register", "Register a serializable plugin manifest.", true, (context, params) => {
			context.document.plugins[params.namespace] = { ...params };
			context.updated.push(`plugins:${params.namespace}`);
			return { namespace: params.namespace };
		}),
		definition("actions.register", "Register a structured reusable action.", true, (context, params) => (
			createResource(context, "actions", { type: "action", ...params })
		))
	];
}
