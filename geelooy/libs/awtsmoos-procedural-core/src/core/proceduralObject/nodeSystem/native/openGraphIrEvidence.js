// B"H
// Boruch Hashem
// Blessed is He
/** Node and link evidence remains explicit for every whole-tree compile. */

export function createOpenGraphNodeEvidence(node, surface, executors) {
	const definition = surface.registry.resolve(node.type);
	return Object.freeze({
		...node,
		title: definition?.title ?? node.type,
		category: definition?.metadata?.category ?? "unknown",
		nativeType: definition?.metadata?.nativeType ?? null,
		nativeSemantics: definition?.metadata?.nativeSemantics === true,
		executable: executors?.has?.(node.type) === true,
		requiredCapabilities: definition?.metadata?.requiredCapabilities ?? []
	});
}

export function createOpenGraphLinkEvidence(link, nodeMap, surface) {
	const source = nodeMap.get(link.from.nodeId);
	const target = nodeMap.get(link.to.nodeId);
	if (!source || !target) {
		return Object.freeze({
			...link,
			compatible: false,
			reason: "Missing link endpoint."
		});
	}
	return Object.freeze({
		...link,
		...surface.planConnection({
			from: { nodeType: source.type, socketId: link.from.socketId },
			to: { nodeType: target.type, socketId: link.to.socketId }
		})
	});
}
