// B"H
// Boruch Hashem
// Blessed is He
/** Geometry trees compile into an inspectable topology, field, instance, and zone IR. */

import { hashCanonicalValue } from "../../foundation/canonical/index.js";
import { compileUniversalNodeTreePlan } from "../compileUniversalNodeTreePlan.js";
import { createNativeNodeDefinitionRegistry } from "./createNativeNodeSchemaPack.js";

function nodePlan(node, registry) {
	const definition = registry.resolve(node.type);
	return Object.freeze({
		id: node.id,
		type: node.type,
		category: definition?.metadata.category ?? "unknown",
		topology: definition?.metadata.topology ?? "none",
		timeDependent: definition?.metadata.timeDependent === true,
		requiredCapabilities: definition?.metadata.requiredCapabilities ?? [],
		config: node.config,
		inputs: node.inputs
	});
}

/**
 * Creates backend-neutral geometry execution intent.
 * @param {Object} treeInput - Universal geometry node tree.
 * @param {Object} options - Optional definition registry.
 * @returns {Object} Immutable geometry graph IR.
 */
export function createGeometryGraphIr(treeInput, options = {}) {
	const registry = options.definitionRegistry
		?? options.registry
		?? createNativeNodeDefinitionRegistry();
	const plan = compileUniversalNodeTreePlan(treeInput, {
		...options,
		definitionRegistry: registry
	});
	const nodes = Object.freeze(plan.tree.nodes.map(
		(node) => nodePlan(node, registry)
	));
	const content = {
		kind: "geometry-graph-ir",
		treeId: plan.tree.id,
		treeHash: plan.tree.contentHash,
		schedule: plan.schedule,
		nodes,
		links: plan.tree.links,
		zones: plan.zones,
		interfaceItems: plan.interfaceItems,
		topologyMutationNodes: nodes.filter(
			(node) => !["none", "preserve"].includes(node.topology)
		).map((node) => node.id),
		timeDependentNodes: nodes.filter(
			(node) => node.timeDependent
		).map((node) => node.id),
		requiredCapabilities: [...new Set(
			nodes.flatMap((node) => node.requiredCapabilities)
		)].sort(),
		diagnostics: plan.diagnostics
	};
	return Object.freeze({
		...content,
		ok: plan.ok,
		contentHash: hashCanonicalValue(content)
	});
}
