// B"H
// Boruch Hashem
// Blessed is He
/** Material compilation plans reveal backend support before shader work is attempted. */

import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { hashCanonicalValue } from "../foundation/canonical/index.js";
import { validateUniversalNodeGraph } from "./validateUniversalNodeGraph.js";

function sortedUnique(values = []) {
	return Object.freeze([...new Set(values.map(String))].sort());
}

function normalizeBackend(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Material compile plan requires a backend declaration.");
	}
	if (typeof input.id !== "string" || !input.id.trim()) {
		throw new TypeError("Material compile plan backend id must be non-empty text.");
	}
	const capabilityInput = input.capabilities ?? input.requiredCapabilities;
	const capabilitiesDeclared = Array.isArray(capabilityInput);
	return Object.freeze({
		id: input.id.trim(),
		version: typeof input.version === "string" ? input.version : null,
		supportedNodeTypes: sortedUnique(input.supportedNodeTypes ?? []),
		capabilities: sortedUnique(capabilityInput ?? []),
		capabilitiesDeclared,
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}

function createNodePlans(graph, supportedNodeTypes) {
	return Object.freeze(graph.nodes.map(node => Object.freeze({
		nodeId: node.id,
		type: node.type,
		status: supportedNodeTypes.has(node.type) ? "supported" : "unsupported"
	})));
}

function collectUnsupportedTypes(plans) {
	return sortedUnique(plans
		.filter(plan => plan.status === "unsupported")
		.map(plan => plan.type));
}

function collectGraphCapabilities(validation) {
	return sortedUnique(validation.graph.nodes.flatMap(node => {
		const definition = validation.definitions.get(node.id);
		return definition?.metadata?.requiredCapabilities ?? [];
	}));
}

export function createMaterialCompilePlan(input, options = {}) {
	const backend = normalizeBackend(options.backend);
	const validation = validateUniversalNodeGraph(input, options);
	const supportedNodeTypes = new Set(backend.supportedNodeTypes);
	const plans = createNodePlans(validation.graph, supportedNodeTypes);
	const unsupportedNodeTypes = collectUnsupportedTypes(plans);
	const requiredCapabilities = collectGraphCapabilities(validation);
	const missingCapabilities = backend.capabilitiesDeclared
		? Object.freeze(requiredCapabilities.filter(capability => (
			!backend.capabilities.includes(capability)
		)))
		: Object.freeze([]);
	const content = Object.freeze({
		graphId: validation.graph.id,
		graphHash: validation.graph.contentHash,
		backend,
		nodePlans: plans,
		unsupportedNodeTypes,
		requiredCapabilities,
		missingCapabilities
	});
	return Object.freeze({
		schema: "awtsmoos.material-compile-plan",
		ok: validation.ok
			&& unsupportedNodeTypes.length === 0
			&& missingCapabilities.length === 0,
		contentHash: hashCanonicalValue(content),
		...content,
		diagnostics: validation.diagnostics
	});
}
