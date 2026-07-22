// B"H
// Boruch Hashem
// Blessed is He
/** Whole trees become connection-audited backend-neutral execution intent. */

import { hashCanonicalValue } from "../../foundation/canonical/index.js";
import { compileUniversalNodeTreePlan } from "../compileUniversalNodeTreePlan.js";
import { createOpenBlenderNodeApiSurface } from "./createOpenBlenderNodeApiSurface.js";

function nodeEvidence(node, surface, executorRegistry) {
	const definition = surface.registry.resolve(node.type);
	return Object.freeze({
		id: node.id,
		type: node.type,
		title: definition?.title ?? node.type,
		family: definition?.family ?? definition?.metadata?.family ?? "unknown",
		category: definition?.metadata?.category ?? "unknown",
		nativeType: definition?.metadata?.nativeType ?? null,
		nativeSemantics: definition?.metadata?.nativeSemantics === true,
		executable: executorRegistry?.has?.(node.type) === true,
		inputs: node.inputs,
		config: node.config,
		requiredCapabilities: definition?.metadata?.requiredCapabilities ?? []
	});
}

function linkEvidence(link, nodeMap, surface) {
	const sourceNode = nodeMap.get(link.from.nodeId);
	const targetNode = nodeMap.get(link.to.nodeId);
	const connection = surface.planConnection({
		from: {
			nodeType: sourceNode.type,
			socketId: link.from.socketId
		},
		to: {
			nodeType: targetNode.type,
			socketId: link.to.socketId
		}
	});
	return Object.freeze({
		id: link.id,
		from: link.from,
		to: link.to,
		...connection
	});
}

/**
 * Compiles any merged Blender/native tree into deterministic graph IR.
 * @param {Object} treeInput - Universal node tree input.
 * @param {Object} options - Version, registry, executor, and compile policy.
 * @returns {Object} Connection-audited whole-tree intermediate representation.
 */
export function createOpenBlenderGraphIr(treeInput, options = {}) {
	const surface = options.surface ?? createOpenBlenderNodeApiSurface(options);
	const executorRegistry = options.executorRegistry ?? null;
	const treePlan = compileUniversalNodeTreePlan(treeInput, {
		...options,
		definitionRegistry: surface.registry
	});
	const nodeMap = new Map(treePlan.tree.nodes.map((node) => [node.id, node]));
	const nodes = Object.freeze(treePlan.tree.nodes.map(
		(node) => nodeEvidence(node, surface, executorRegistry)
	));
	const links = Object.freeze(treePlan.tree.links.map(
		(link) => linkEvidence(link, nodeMap, surface)
	));
	const invalidLinks = links.filter((link) => !link.compatible);
	const content = {
		kind: "open-blender-node-graph-ir",
		treeId: treePlan.tree.id,
		treeKind: treePlan.tree.kind,
		treeHash: treePlan.tree.contentHash,
		blenderVersion: surface.blenderVersion,
		schedule: treePlan.schedule,
		nodes,
		links,
		zones: treePlan.zones,
		interfaceItems: treePlan.interfaceItems,
		requiredCapabilities: [...new Set(
			nodes.flatMap((node) => node.requiredCapabilities)
		)].sort(),
		executableNodes: nodes.filter((node) => node.executable).map((node) => node.id),
		invalidLinkIds: invalidLinks.map((link) => link.id),
		diagnostics: Object.freeze([
			...treePlan.diagnostics,
			...invalidLinks.map((link) => ({
				code: "OPEN_NODE_LINK_INCOMPATIBLE",
				linkId: link.id,
				message: link.reason
			}))
		])
	};
	return Object.freeze({
		...content,
		ok: treePlan.ok && invalidLinks.length === 0,
		contentHash: hashCanonicalValue(content)
	});
}
