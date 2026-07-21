// B"H
// Boruch Hashem
// Blessed is He
/** Unknown Blender nodes remain whole, named, and round-trippable instead of vanishing. */

import { createNodeDefinition } from "../nodes/createNodeDefinition.js";

function slug(value) {
	return String(value)
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/[^A-Za-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.toLowerCase();
}

function normalizeSocket(socket) {
	return {
		id: socket.id ?? slug(socket.identifier ?? socket.name),
		name: socket.name ?? socket.identifier ?? socket.id,
		type: socket.type ?? "opaque",
		multiInput: socket.multiInput === true,
		defaultValue: socket.defaultValue ?? null,
		metadata: {
			nativeType: socket.nativeType ?? null,
			hideValue: socket.hideValue === true,
			linkLimit: socket.linkLimit ?? null,
			metadata: socket.metadata ?? {}
		}
	};
}

export function createOpaqueBlenderNodeDefinition(input) {
	if (typeof input?.nativeType !== "string" || !input.nativeType.trim()) {
		throw new TypeError("Opaque Blender node requires nativeType text.");
	}
	return createNodeDefinition({
		type: input.type ?? `blender.node.${slug(input.nativeType)}`,
		title: input.title ?? input.nativeType,
		inputs: (input.inputs ?? []).map(normalizeSocket),
		outputs: (input.outputs ?? []).map(normalizeSocket),
		metadata: {
			opaque: true,
			nativeType: input.nativeType,
			treeType: input.treeType ?? null,
			blenderVersion: input.blenderVersion ?? null,
			properties: input.properties ?? {},
			metadata: input.metadata ?? {}
		}
	});
}
