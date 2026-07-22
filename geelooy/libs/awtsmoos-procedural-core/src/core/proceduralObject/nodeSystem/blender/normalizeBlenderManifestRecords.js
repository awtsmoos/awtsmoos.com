// B"H
// Boruch Hashem
// Blessed is He
/** Deep sorting lets identical Blender RNA universes hash identically in every harvest order. */

import { cloneManifestMetadata } from "../../foundation/canonical/cloneManifestMetadata.js";

export function sortRecords(values = [], key = "id") {
	return Object.freeze(values.map(value => cloneManifestMetadata(value))
		.sort((left, right) => String(left[key] ?? "").localeCompare(String(right[key] ?? ""))));
}

function normalizeNode(node) {
	return Object.freeze({
		...cloneManifestMetadata(node),
		nativeType: String(node.nativeType ?? node.blIdname ?? "UnknownNode"),
		inputs: sortRecords(node.inputs, "identifier"),
		outputs: sortRecords(node.outputs, "identifier"),
		properties: sortRecords(node.properties, "identifier"),
		pollModes: Object.freeze([...(node.pollModes ?? [])].map(String).sort()),
		toolContexts: Object.freeze([...(node.toolContexts ?? [])].map(String).sort())
	});
}

export function normalizeTreeRecord(tree) {
	return Object.freeze({
		nativeType: String(tree.nativeType ?? tree.id ?? "UnknownNodeTree"),
		name: String(tree.name ?? tree.nativeType ?? tree.id ?? "Unknown Node Tree"),
		category: String(tree.category ?? "general"),
		nodes: Object.freeze((tree.nodes ?? []).map(normalizeNode)
			.sort((left, right) => left.nativeType.localeCompare(right.nativeType))),
		metadata: cloneManifestMetadata(tree.metadata ?? {})
	});
}

export function normalizeModifierRecord(modifier) {
	return Object.freeze({
		...cloneManifestMetadata(modifier),
		nativeType: String(modifier.nativeType ?? modifier.identifier ?? "UnknownModifier"),
		properties: sortRecords(modifier.properties, "identifier"),
		domains: Object.freeze([...(modifier.domains ?? ["object"])].map(String).sort())
	});
}
