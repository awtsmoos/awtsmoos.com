// B"H
// Boruch Hashem
// Blessed is He
/** Material compilation plans reveal backend support before shader work is attempted. */

import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { hashCanonicalValue } from "../foundation/canonical/index.js";
import { validateUniversalNodeGraph } from "./validateUniversalNodeGraph.js";

export function createMaterialCompilePlan(input, options = {}) {
	const backend = options.backend;
	if (!backend || typeof backend.id !== "string") throw new TypeError("Material compile plan requires a backend declaration.");
	const validation = validateUniversalNodeGraph(input, options);
	const supportedTypes = new Set(backend.supportedNodeTypes ?? []);
	const nodePlans = validation.graph.nodes.map(node => Object.freeze({
		nodeId: node.id,
		type: node.type,
		status: supportedTypes.has(node.type) ? "supported" : "unsupported"
	}));
	const unsupportedNodeTypes = Object.freeze([...new Set(nodePlans
		.filter(plan => plan.status === "unsupported")
		.map(plan => plan.type))].sort());
	const requiredCapabilities = Object.freeze([...new Set(validation.graph.nodes.flatMap(node => {
		const definition = validation.definitions.get(node.id);
		return definition?.metadata?.requiredCapabilities ?? [];
	}))].sort());
	const content = Object.freeze({
		graphId: validation.graph.id,
		graphHash: validation.graph.contentHash,
		backend: cloneManifestMetadata(backend),
		nodePlans: Object.freeze(nodePlans),
		unsupportedNodeTypes,
		requiredCapabilities
	});
	return Object.freeze({
		schema: "awtsmoos.material-compile-plan",
		ok: validation.ok && unsupportedNodeTypes.length === 0,
		contentHash: hashCanonicalValue(content),
		...content,
		diagnostics: validation.diagnostics
	});
}
