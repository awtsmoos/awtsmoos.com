// B"H
// Boruch Hashem
// Blessed is He
/** Granular schema differences reveal exactly which Blender openings changed between builds. */

import { hashCanonicalValue } from "../../foundation/canonical/index.js";

function mapBy(values, key) {
	return new Map((values ?? []).map(value => [String(value[key]), value]));
}

export function diffRecordSet(fromValues, toValues, options) {
	const from = mapBy(fromValues, options.key);
	const to = mapBy(toValues, options.key);
	const operations = [];
	for (const [id, value] of from) {
		if (!to.has(id)) operations.push({ op: `remove-${options.kind}`, id, before: value });
	}
	for (const [id, value] of to) {
		if (!from.has(id)) operations.push({ op: `add-${options.kind}`, id, after: value });
		else if (hashCanonicalValue(from.get(id)) !== hashCanonicalValue(value)) {
			operations.push({ op: `change-${options.kind}`, id, before: from.get(id), after: value });
		}
	}
	return operations;
}

export function flattenManifestNodes(manifest) {
	return manifest.treeTypes.flatMap(tree => tree.nodes.map(node => ({
		...node,
		migrationId: `${tree.nativeType}:${node.nativeType}`,
		treeType: tree.nativeType
	})));
}

export function flattenNodeSockets(nodes) {
	return nodes.flatMap(node => [
		...(node.inputs ?? []).map(socket => ({
			...socket,
			migrationId: `${node.migrationId}:input:${socket.identifier ?? socket.name}`
		})),
		...(node.outputs ?? []).map(socket => ({
			...socket,
			migrationId: `${node.migrationId}:output:${socket.identifier ?? socket.name}`
		}))
	]);
}

export function flattenNodeProperties(nodes) {
	return nodes.flatMap(node => (node.properties ?? []).map(property => ({
		...property,
		migrationId: `${node.migrationId}:${property.identifier ?? property.name}`
	})));
}
