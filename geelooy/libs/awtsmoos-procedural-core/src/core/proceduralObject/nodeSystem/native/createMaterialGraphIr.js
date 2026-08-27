// B"H
// Boruch Hashem
// Blessed is He
/** Material trees compile into closures, textures, optics, volumes, and outputs. */

import { hashCanonicalValue } from "../../foundation/canonical/index.js";
import { compileUniversalNodeTreePlan } from "../compileUniversalNodeTreePlan.js";
import { createNativeNodeDefinitionRegistry } from "./createNativeNodeSchemaPack.js";

function classify(definition) {
	const category = definition?.metadata.category ?? "unknown";
	if (["surface", "hair", "closure", "emission"].includes(category)) {
		return "surface";
	}
	if (category === "volume") {
		return "volume";
	}
	if (category === "displacement") {
		return "displacement";
	}
	if (category === "texture") {
		return "texture";
	}
	if (category === "output") {
		return "output";
	}
	return "value";
}

/** Creates a backend-neutral material graph intermediate representation. */
export function createMaterialGraphIr(treeInput, options = {}) {
	const registry = options.definitionRegistry
		?? options.registry
		?? createNativeNodeDefinitionRegistry();
	const plan = compileUniversalNodeTreePlan(treeInput, {
		...options,
		definitionRegistry: registry
	});
	const nodes = Object.freeze(plan.tree.nodes.map((node) => {
		const definition = registry.resolve(node.type);
		return Object.freeze({
			id: node.id,
			type: node.type,
			stage: classify(definition),
			category: definition?.metadata.category ?? "unknown",
			requiredCapabilities: definition?.metadata.requiredCapabilities ?? [],
			config: node.config,
			inputs: node.inputs
		});
	}));
	const content = {
		kind: "material-graph-ir",
		treeId: plan.tree.id,
		treeHash: plan.tree.contentHash,
		schedule: plan.schedule,
		nodes,
		links: plan.tree.links,
		stages: Object.freeze(Object.fromEntries([
			"surface", "volume", "displacement", "texture", "value", "output"
		].map((stage) => [stage, nodes.filter(
			(node) => node.stage === stage
		).map((node) => node.id)]))),
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
