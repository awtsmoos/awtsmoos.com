// B"H
// Boruch Hashem
// Blessed is He
/** A node definition names every opening before values travel through the graph. */

import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { createStableId } from "../foundation/artifacts/createStableId.js";
import { assertNodeSocketType } from "./socketTypes.js";

const ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;

function normalizeSocket(input, direction) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Node socket must be an object.");
	}
	if (typeof input.id !== "string" || !ID_PATTERN.test(input.id)) {
		throw new TypeError("Node socket id must be a machine identifier.");
	}
	return Object.freeze({
		id: input.id,
		name: typeof input.name === "string" ? input.name : input.id,
		direction,
		type: assertNodeSocketType(input.type),
		multiInput: direction === "input" && input.multiInput === true,
		defaultValue: cloneManifestMetadata(input.defaultValue ?? null),
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}

export function createNodeDefinition(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Node definition must be an object.");
	}
	if (typeof input.type !== "string" || !ID_PATTERN.test(input.type)) {
		throw new TypeError("Node type must be a machine identifier.");
	}
	const inputs = Object.freeze((input.inputs ?? []).map(socket => normalizeSocket(socket, "input")));
	const outputs = Object.freeze((input.outputs ?? []).map(socket => normalizeSocket(socket, "output")));
	const ids = new Set([...inputs, ...outputs].map(socket => `${socket.direction}:${socket.id}`));
	if (ids.size !== inputs.length + outputs.length) throw new Error("Node socket ids must be unique per direction.");
	return Object.freeze({
		schema: "awtsmoos.node-definition",
		id: input.id ?? createStableId("node.definition", { type: input.type, inputs, outputs }),
		type: input.type,
		title: typeof input.title === "string" ? input.title : input.type,
		inputs, outputs,
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}
