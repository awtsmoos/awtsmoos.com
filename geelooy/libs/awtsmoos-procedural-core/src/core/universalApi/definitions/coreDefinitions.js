// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { IDENTIFIED_OBJECT_SCHEMA, QUERY_SCHEMA } from "./commonSchemas.js";
import { createResource, deleteResource, updateResource } from "../resourceOperations.js";
import { queryResources } from "../query.js";

function resourceDefinition(id, bucket, verb, execute, ui = {}) {
	return {
		id,
		namespace: id.split(".").slice(0, -1).join("."),
		runtimeName: id.split(".").at(-1),
		label: id,
		description: `${verb} a stable ${bucket} resource.`,
		paramsSchema: IDENTIFIED_OBJECT_SCHEMA,
		resultSchema: { type: "object" },
		permissions: ["world.write"],
		transaction: "atomic",
		undo: true,
		sideEffects: ["document", "runtime", "ui"],
		cost: "medium",
		ui: { panel: bucket, control: "form", ...ui },
		examples: [{ id: `${bucket}-example` }],
		mutates: true,
		execute
	};
}

/** Definitions shared by JSON commands, runtime aliases, UI, docs, and tests. */
export function createCoreDefinitions() {
	return [
		resourceDefinition("resources.create", "objects", "Create", (context, params) => (
			createResource(context, params.bucket ?? "objects", params)
		)),
		resourceDefinition("resources.update", "objects", "Update", (context, params) => (
			updateResource(context, params.bucket ?? "objects", params)
		)),
		resourceDefinition("resources.delete", "objects", "Delete", (context, params) => (
			deleteResource(context, params.bucket ?? "objects", params)
		)),
		resourceDefinition("core.meshes.create", "meshes", "Create", (context, params) => (
			createResource(context, "meshes", { type: "mesh", ...params })
		), { expert: true }),
		{
			...resourceDefinition("core.modifiers.add", "objects", "Update", (context, params) => {
				const bucket = context.document.resources.objects[params.objectId] ? "objects" : "meshes";
				const previous = context.document.resources[bucket][params.objectId];
				return updateResource(context, bucket, {
					...previous,
					id: params.objectId,
					modifiers: [...(previous?.modifiers ?? []), params.modifier]
				});
			}, { expert: true }),
			paramsSchema: {
				type: "object",
				required: ["objectId", "modifier"],
				properties: {
					objectId: { type: "string" },
					modifier: { type: "object" }
				}
			}
		},
		{
			id: "api.query",
			namespace: "api",
			runtimeName: "query",
			label: "Query resources",
			description: "Deterministically filter and project authoritative resources.",
			paramsSchema: QUERY_SCHEMA,
			resultSchema: { type: "object" },
			permissions: ["world.read"],
			transaction: "read-only",
			undo: false,
			sideEffects: [],
			cost: "low",
			ui: { panel: "Resources", control: "query" },
			examples: [{ resource: "objects", limit: 100 }],
			mutates: false,
			execute: (context, params) => queryResources(context.document, params)
		}
	];
}
