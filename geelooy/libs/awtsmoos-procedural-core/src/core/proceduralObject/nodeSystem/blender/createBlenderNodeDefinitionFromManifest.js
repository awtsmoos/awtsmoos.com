// B"H
// Boruch Hashem
// Blessed is He
/** Harvested Blender nodes become universal definitions while native RNA remains untouched. */

import { createNodeDefinition } from "../../nodes/createNodeDefinition.js";
import { createBlenderPropertySchema } from "./createBlenderPropertySchema.js";
import { blenderTypeIdentifier, normalizeBlenderIdentifier } from "./normalizeBlenderIdentifier.js";
import { mapBlenderSocketType } from "./mapBlenderSocketType.js";

function sockets(values = []) {
	const seen = new Map();
	return values.map((socket, index) => {
		const nativeIdentifier = String(socket.identifier ?? socket.nativeIdentifier ?? socket.name ?? `socket-${index}`);
		const base = normalizeBlenderIdentifier(nativeIdentifier, `socket-${index}`);
		const count = seen.get(base) ?? 0;
		seen.set(base, count + 1);
		const mapped = mapBlenderSocketType(socket);
		return {
			id: count === 0 ? base : `${base}-${count + 1}`,
			name: String(socket.name ?? nativeIdentifier),
			type: mapped.type,
			multiInput: socket.multiInput === true,
			defaultValue: socket.defaultValue ?? null,
			metadata: {
				nativeIdentifier,
				nativeType: mapped.nativeType,
				baseType: mapped.baseType,
				opaque: mapped.opaque,
				fieldCapable: socket.fieldCapable === true,
				hideValue: socket.hideValue === true,
				linkLimit: socket.linkLimit ?? null,
				minimum: socket.minimum ?? null,
				maximum: socket.maximum ?? null,
				subtype: socket.subtype ?? null
			}
		};
	});
}

export function createBlenderNodeDefinitionFromManifest(node, context = {}) {
	const nativeType = String(node?.nativeType ?? node?.blIdname ?? "UnknownNode");
	const treeType = String(context.treeType ?? node?.treeType ?? "UnknownNodeTree");
	return createNodeDefinition({
		type: blenderTypeIdentifier("node", nativeType, treeType),
		title: String(node?.name ?? node?.title ?? nativeType),
		inputs: sockets(node?.inputs),
		outputs: sockets(node?.outputs),
		metadata: {
			opaque: node?.opaque === true,
			nativeType,
			treeType,
			blenderVersion: context.blenderVersion ?? node?.blenderVersion ?? null,
			category: node?.category ?? null,
			properties: (node?.properties ?? []).map(createBlenderPropertySchema),
			pollModes: node?.pollModes ?? [],
			toolContexts: node?.toolContexts ?? [],
			zoneRole: node?.zoneRole ?? null,
			metadata: node?.metadata ?? {}
		}
	});
}
