// B"H
// Boruch Hashem
// Blessed is He
/**
 * Validation keeps every socket and zone visible. The Awtsmoos does not permit
 * Awtsmoos.com to conceal broken node references behind an opaque adapter.
 */
import { createUniversalNodeTree } from "./createUniversalNodeTree.js";
import { validateUniversalNodeGraph } from "./validateUniversalNodeGraph.js";

function add(diagnostics, code, message, metadata = {}) {
	diagnostics.push(Object.freeze({ code, message, metadata: Object.freeze(metadata) }));
}

/** Validates structural representation and optional executable definitions. */
export function validateUniversalNodeTree(input, options = {}) {
	const tree = createUniversalNodeTree(input);
	const diagnostics = [];
	const nodeIds = new Set(tree.nodes.map(node => node.id));
	const frameIds = new Set(tree.frames.map(frame => frame.id));
	for (const node of tree.nodes) {
		if (node.parentId && !frameIds.has(node.parentId) && !nodeIds.has(node.parentId)) {
			add(diagnostics, "NODE.PARENT_MISSING", "Node parent is unavailable.", { nodeId: node.id });
		}
	}
	for (const link of tree.links) {
		if (!nodeIds.has(link.from.nodeId) || !nodeIds.has(link.to.nodeId)) {
			add(diagnostics, "NODE.LINK_NODE_MISSING", "Link endpoint is unavailable.", { linkId: link.id });
		}
	}
	for (const zone of tree.zones) {
		if (zone.inputNodeId && !nodeIds.has(zone.inputNodeId)) {
			add(diagnostics, "NODE.ZONE_INPUT_MISSING", "Zone input node is unavailable.", { zoneId: zone.id });
		}
		if (zone.outputNodeId && !nodeIds.has(zone.outputNodeId)) {
			add(diagnostics, "NODE.ZONE_OUTPUT_MISSING", "Zone output node is unavailable.", { zoneId: zone.id });
		}
		for (const nodeId of zone.bodyNodeIds) {
			if (!nodeIds.has(nodeId)) add(diagnostics, "NODE.ZONE_BODY_MISSING", "Zone body node is unavailable.", { zoneId: zone.id, nodeId });
		}
	}
	let executableValidation = null;
	if (options.definitionRegistry ?? options.registry) {
		executableValidation = validateUniversalNodeGraph({
			...tree,
			links: tree.links.filter(link => !link.muted)
		}, options);
		diagnostics.push(...executableValidation.diagnostics);
	}
	return Object.freeze({
		ok: diagnostics.length === 0,
		tree,
		diagnostics: Object.freeze(diagnostics),
		executableValidation
	});
}
