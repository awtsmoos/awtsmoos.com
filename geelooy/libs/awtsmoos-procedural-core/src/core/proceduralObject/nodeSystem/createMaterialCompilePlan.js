// B"H
// Boruch Hashem
// Blessed is He
/** Material plans expose node, capability, and link-conversion support before shader work. */

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
	return Object.freeze({
		id: input.id.trim(),
		version: typeof input.version === "string" ? input.version : null,
		supportedNodeTypes: sortedUnique(input.supportedNodeTypes ?? []),
		supportedConversions: sortedUnique(input.supportedConversions ?? []),
		conversionsDeclared: Array.isArray(input.supportedConversions),
		capabilities: sortedUnique(capabilityInput ?? []),
		capabilitiesDeclared: Array.isArray(capabilityInput),
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

function unsupportedNodeTypes(plans) {
	return sortedUnique(plans
		.filter(plan => plan.status === "unsupported")
		.map(plan => plan.type));
}

function graphCapabilities(validation) {
	return sortedUnique(validation.graph.nodes.flatMap(node => {
		const definition = validation.definitions.get(node.id);
		return definition?.metadata?.requiredCapabilities ?? [];
	}));
}

function requiredConversions(linkPlans) {
	return sortedUnique(linkPlans
		.filter(plan => plan.active && plan.compatible && plan.conversion !== null)
		.map(plan => plan.conversion));
}

function createMaterialLinkPlans(linkPlans, supportedConversions, declared) {
	return Object.freeze(linkPlans.map(plan => Object.freeze({
		...plan,
		backendStatus: !plan.active
			? "inactive"
			: !plan.compatible
				? "incompatible"
				: plan.conversion === null || !declared || supportedConversions.has(plan.conversion)
					? "supported"
					: "unsupported-conversion"
	})));
}

export function createMaterialCompilePlan(input, options = {}) {
	const backend = normalizeBackend(options.backend);
	const validation = validateUniversalNodeGraph(input, options);
	const nodePlans = createNodePlans(validation.graph, new Set(backend.supportedNodeTypes));
	const unsupportedTypes = unsupportedNodeTypes(nodePlans);
	const requiredCapabilities = graphCapabilities(validation);
	const missingCapabilities = backend.capabilitiesDeclared
		? Object.freeze(requiredCapabilities.filter(capability => (
			!backend.capabilities.includes(capability)
		)))
		: Object.freeze([]);
	const conversions = requiredConversions(validation.linkPlans);
	const unsupportedConversions = backend.conversionsDeclared
		? Object.freeze(conversions.filter(conversion => (
			!backend.supportedConversions.includes(conversion)
		)))
		: Object.freeze([]);
	const linkPlans = createMaterialLinkPlans(
		validation.linkPlans,
		new Set(backend.supportedConversions),
		backend.conversionsDeclared
	);
	const content = Object.freeze({
		graphId: validation.graph.id,
		graphHash: validation.graph.contentHash,
		backend,
		nodePlans,
		linkPlans,
		unsupportedNodeTypes: unsupportedTypes,
		requiredCapabilities,
		missingCapabilities,
		requiredConversions: conversions,
		unsupportedConversions
	});
	return Object.freeze({
		schema: "awtsmoos.material-compile-plan",
		ok: validation.ok
			&& unsupportedTypes.length === 0
			&& missingCapabilities.length === 0
			&& unsupportedConversions.length === 0,
		contentHash: hashCanonicalValue(content),
		...content,
		diagnostics: validation.diagnostics
	});
}
