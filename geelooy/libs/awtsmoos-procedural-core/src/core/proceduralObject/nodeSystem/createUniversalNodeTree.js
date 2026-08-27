// B"H
// Boruch Hashem
// Blessed is He
/**
 * Every node tree is an ordered covenant of sockets, links, groups, and zones.
 * The Awtsmoos permits Awtsmoos.com to preserve any present or future node
 * without borrowing an editor implementation or erasing unknown properties.
 */
import { createStableId } from "../foundation/artifacts/createStableId.js";
import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { hashCanonicalValue } from "../foundation/canonical/index.js";
import { createUniversalNodeGraph } from "./createUniversalNodeGraph.js";

function normalizedNode(node, graphNode) {
	return Object.freeze({
		...graphNode,
		label: node.label ?? "",
		parentId: node.parentId ?? null,
		muted: node.muted === true,
		hidden: node.hidden === true,
		dimensions: Object.freeze([...(node.dimensions ?? [0, 0])].map(Number)),
		properties: cloneManifestMetadata(node.properties ?? {}),
		internalLinks: cloneManifestMetadata(node.internalLinks ?? [])
	});
}

function normalizedLink(link, index) {
	return Object.freeze({
		id: link.id ?? `link-${index}`,
		index: Number.isInteger(link.index) ? link.index : index,
		from: Object.freeze({ ...link.from }),
		to: Object.freeze({ ...link.to }),
		muted: link.muted === true,
		metadata: cloneManifestMetadata(link.metadata ?? {})
	});
}

function normalizedItem(item, index) {
	return Object.freeze({
		id: item.id ?? `item-${index}`,
		kind: item.kind ?? "socket",
		name: item.name ?? item.id ?? `Item ${index}`,
		direction: item.direction ?? null,
		socketType: item.socketType ?? item.type ?? null,
		parentId: item.parentId ?? null,
		defaultValue: cloneManifestMetadata(item.defaultValue ?? null),
		metadata: cloneManifestMetadata(item.metadata ?? {})
	});
}

function normalizedZone(zone, index) {
	return Object.freeze({
		id: zone.id ?? `zone-${index}`,
		type: zone.type ?? "simulation",
		inputNodeId: zone.inputNodeId ?? null,
		outputNodeId: zone.outputNodeId ?? null,
		bodyNodeIds: Object.freeze([...(zone.bodyNodeIds ?? [])]),
		items: Object.freeze((zone.items ?? []).map(normalizedItem)),
		iterations: zone.iterations ?? null,
		metadata: cloneManifestMetadata(zone.metadata ?? {})
	});
}

/** Creates a complete renderer-neutral geometry, material, or simulation tree. */
export function createUniversalNodeTree(input) {
	const graph = createUniversalNodeGraph({
		...input,
		links: (input.links ?? []).filter(link => link.muted !== true)
	});
	const sourceNodes = new Map((input.nodes ?? []).map(node => [node.id, node]));
	const content = Object.freeze({
		...graph,
		schema: "awtsmoos.universal-node-tree",
		nodes: Object.freeze(graph.nodes.map(node => normalizedNode(
			sourceNodes.get(node.id) ?? {},
			node
		))),
		links: Object.freeze((input.links ?? []).map(normalizedLink)
			.sort((left, right) => left.index - right.index)),
		interfaceItems: Object.freeze((input.interfaceItems ?? []).map(normalizedItem)),
		frames: Object.freeze(cloneManifestMetadata(input.frames ?? [])),
		groups: Object.freeze(cloneManifestMetadata(input.groups ?? [])),
		zones: Object.freeze((input.zones ?? []).map(normalizedZone)),
		treeProperties: cloneManifestMetadata(input.treeProperties ?? {})
	});
	const hashable = { ...content };
	delete hashable.id;
	delete hashable.contentHash;
	return Object.freeze({
		...content,
		id: input.id ?? createStableId("universal.node-tree", hashable),
		contentHash: hashCanonicalValue(hashable)
	});
}
