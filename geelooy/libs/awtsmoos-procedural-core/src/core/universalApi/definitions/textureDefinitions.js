// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { IDENTIFIED_OBJECT_SCHEMA } from "./commonSchemas.js";
import { createResource, updateResource } from "../resourceOperations.js";

function tagsMatch(texture, tags = {}) {
	const values = new Set(texture.tags ?? []);
	return (tags.all ?? []).every((tag) => values.has(tag))
		&& (!(tags.any?.length) || tags.any.some((tag) => values.has(tag)));
}

/** Texture registry definitions operating on authoritative texture resources. */
export function createTextureDefinitions() {
	return [
		{
			id: "textures.register",
			namespace: "textures",
			runtimeName: "register",
			label: "Register texture",
			description: "Register a repository, URL, user, embedded, or runtime texture.",
			paramsSchema: IDENTIFIED_OBJECT_SCHEMA,
			resultSchema: { type: "object" },
			permissions: ["assets.write"],
			transaction: "atomic",
			undo: true,
			sideEffects: ["document", "runtime", "ui"],
			cost: "low",
			ui: { panel: "Textures", control: "form" },
			examples: [{ id: "user-texture", source: { kind: "url", url: "/texture.webp" } }],
			mutates: true,
			execute: (context, params) => createResource(context, "textures", params)
		},
		{
			id: "textures.replace",
			namespace: "textures",
			runtimeName: "replace",
			label: "Replace texture",
			description: "Replace texture properties while preserving its stable identity.",
			paramsSchema: IDENTIFIED_OBJECT_SCHEMA,
			resultSchema: { type: "object" },
			permissions: ["assets.write"],
			transaction: "atomic",
			undo: true,
			sideEffects: ["document", "runtime", "ui"],
			cost: "low",
			ui: { panel: "Textures", control: "form" },
			examples: [{ id: "texture-id", source: { kind: "url", url: "/replacement.webp" } }],
			mutates: true,
			execute: (context, params) => updateResource(context, "textures", params)
		},
		{
			id: "textures.search",
			namespace: "textures",
			runtimeName: "search",
			label: "Search textures",
			description: "Search texture metadata without loading GPU resources.",
			paramsSchema: { type: "object" },
			resultSchema: { type: "object" },
			permissions: ["assets.read"],
			transaction: "read-only",
			undo: false,
			sideEffects: [],
			cost: "low",
			ui: { panel: "Textures", control: "search" },
			examples: [{ tags: { all: ["water", "normal"] } }],
			mutates: false,
			execute: (context, params) => ({
				items: Object.values(context.document.resources.textures)
					.filter((texture) => tagsMatch(texture, params.tags))
					.sort((a, b) => a.id.localeCompare(b.id))
			})
		}
	];
}
