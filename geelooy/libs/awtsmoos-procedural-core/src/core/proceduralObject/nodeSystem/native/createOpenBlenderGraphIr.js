// B"H
// Boruch Hashem
// Blessed is He
/** Whole trees become connection-audited backend-neutral execution intent. */

import { hashCanonicalValue } from "../../foundation/canonical/index.js";
import { createOpenBlenderNodeApiSurface } from "./createOpenBlenderNodeApiSurface.js";
import {
	createOpenGraphLinkEvidence,
	createOpenGraphNodeEvidence
} from "./openGraphIrEvidence.js";
import { planOpenGraphTree } from "./openGraphIrPlanning.js";
import { createOpenGraphSchedule } from "./openGraphIrSchedule.js";

/** Compiles any merged Blender/native tree into deterministic graph IR. */
export function createOpenBlenderGraphIr(input, options = {}) {
	const surface = options.surface ?? createOpenBlenderNodeApiSurface(options);
	const plan = planOpenGraphTree(input, surface, options);
	const tree = plan.tree;
	const nodeMap = new Map(tree.nodes.map((node) => [node.id, node]));
	const nodes = Object.freeze(tree.nodes.map(
		(node) => createOpenGraphNodeEvidence(
			node,
			surface,
			options.executorRegistry
		)
	));
	const links = Object.freeze(tree.links.map(
		(link) => createOpenGraphLinkEvidence(link, nodeMap, surface)
	));
	const invalidLinks = links.filter((link) => !link.compatible);
	const diagnostics = Object.freeze([
		...(plan.diagnostics ?? []),
		...invalidLinks.map((link) => ({
			code: "OPEN_NODE_LINK_INCOMPATIBLE",
			linkId: link.id,
			message: link.reason
		}))
	]);
	const content = {
		kind: "open-blender-node-graph-ir",
		treeId: tree.id,
		treeKind: tree.kind,
		treeHash: tree.contentHash,
		blenderVersion: surface.blenderVersion,
		schedule: createOpenGraphSchedule(tree.nodes, tree.links),
		nodes,
		links,
		zones: Object.freeze(plan.zones?.length
			? plan.zones
			: (input.zones ?? [])),
		interfaceItems: Object.freeze(
			plan.interfaceItems ?? input.interfaceItems ?? []
		),
		requiredCapabilities: [...new Set(nodes.flatMap(
			(node) => node.requiredCapabilities
		))].sort(),
		executableNodes: nodes
			.filter((node) => node.executable)
			.map((node) => node.id),
		invalidLinkIds: invalidLinks.map((link) => link.id),
		diagnostics
	};
	return Object.freeze({
		...content,
		ok: invalidLinks.length === 0,
		contentHash: hashCanonicalValue(content)
	});
}
