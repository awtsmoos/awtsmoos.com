// B"H
// Boruch Hashem
// Blessed is He
/**
 * A tree plan preserves every connection even when no local executor exists.
 * The Awtsmoos opens geometry and material intent through Awtsmoos.com without
 * pretending that representation coverage equals native numerical semantics.
 */
import { validateUniversalNodeTree } from "./validateUniversalNodeTree.js";

function linksByTarget(tree) {
	const result = {};
	for (const link of tree.links) {
		const key = `${link.to.nodeId}.${link.to.socketId}`;
		(result[key] ??= []).push(link);
	}
	for (const links of Object.values(result)) links.sort((a, b) => a.index - b.index);
	return result;
}

function representationSchedule(tree) {
	const incoming = new Map(tree.nodes.map(node => [node.id, 0]));
	const outgoing = new Map(tree.nodes.map(node => [node.id, []]));
	for (const link of tree.links.filter(link => !link.muted)) {
		incoming.set(link.to.nodeId, (incoming.get(link.to.nodeId) ?? 0) + 1);
		outgoing.get(link.from.nodeId)?.push(link.to.nodeId);
	}
	const queue = [...incoming].filter(([, count]) => count === 0)
		.map(([id]) => id).sort();
	const schedule = [];
	while (queue.length) {
		const id = queue.shift();
		schedule.push(id);
		for (const target of outgoing.get(id) ?? []) {
			incoming.set(target, incoming.get(target) - 1);
			if (incoming.get(target) === 0) queue.push(target);
		}
		queue.sort();
	}
	return schedule.length === tree.nodes.length ? schedule : tree.nodes.map(node => node.id);
}

/** Compiles a complete backend-neutral connection and zone plan. */
export function compileUniversalNodeTreePlan(input, options = {}) {
	const validation = validateUniversalNodeTree(input, options);
	const definitions = validation.executableValidation?.definitions ?? new Map();
	const nodes = validation.tree.nodes.map(node => Object.freeze({
		...node,
		representationSupported: true,
		executionSupported: definitions.has(node.id),
		nativeSemantics: node.metadata?.nativeSemantics === true
	}));
	return Object.freeze({
		ok: validation.ok,
		tree: validation.tree,
		schedule: Object.freeze(representationSchedule(validation.tree)),
		nodes: Object.freeze(nodes),
		linksByTarget: Object.freeze(linksByTarget(validation.tree)),
		interfaceItems: validation.tree.interfaceItems,
		frames: validation.tree.frames,
		groups: validation.tree.groups,
		zones: validation.tree.zones,
		diagnostics: validation.diagnostics,
		coverage: Object.freeze({
			represented: nodes.length,
			executable: nodes.filter(node => node.executionSupported).length,
			nativeSemantics: nodes.filter(node => node.nativeSemantics).length
		})
	});
}
