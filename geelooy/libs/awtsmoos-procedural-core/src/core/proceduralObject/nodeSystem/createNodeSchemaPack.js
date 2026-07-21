// B"H
// Boruch Hashem
// Blessed is He
/** Versioned schema packs let Blender generations coexist without erasing history. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { hashCanonicalValue } from "../foundation/canonical/index.js";
import { createNodeDefinition } from "../nodes/createNodeDefinition.js";

const ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export function createNodeSchemaPack(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Node schema pack must be an object.");
	}
	if (typeof input.name !== "string" || !ID_PATTERN.test(input.name)) {
		throw new TypeError("Node schema pack name must be a machine identifier.");
	}
	if (typeof input.version !== "string" || !VERSION_PATTERN.test(input.version)) {
		throw new TypeError("Node schema pack version must be semantic version text.");
	}
	const definitions = (input.definitions ?? []).map(createNodeDefinition)
		.sort((left, right) => left.type.localeCompare(right.type));
	if (new Set(definitions.map(definition => definition.type)).size !== definitions.length) {
		throw new Error("Node schema pack definition types must be unique.");
	}
	const content = Object.freeze({
		name: input.name,
		version: input.version,
		family: typeof input.family === "string" ? input.family : "universal",
		definitions: Object.freeze(definitions),
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
	return Object.freeze({
		schema: "awtsmoos.node-schema-pack",
		id: input.id ?? createStableId("node.schema.pack", content),
		contentHash: hashCanonicalValue(content),
		...content
	});
}
