// B"H
// Boruch Hashem
// Blessed is He
/** Validation proves definitions, availability, conversions, cardinality, and native link limits. */

import { createDiagnostic } from "../foundation/diagnostics/index.js";
import { createUniversalLinkPlans } from "./createUniversalLinkPlans.js";
import { createUniversalNodeGraph } from "./createUniversalNodeGraph.js";
import {
	universalDefinitionSocket,
	validateUniversalIncomingLimits,
	validateUniversalLinkPlan
} from "./validateUniversalNodeLinks.js";

function diagnostic(code, message, metadata = {}) {
	return createDiagnostic({ code, message, metadata });
}

function resolveDefinitions(graph, registry, diagnostics) {
	const definitions = new Map();
	for (const node of graph.nodes) {
		const definition = registry.resolve(node.type);
		if (!definition) {
			diagnostics.push(diagnostic(
				"NODE.DEFINITION_MISSING",
				`Node definition is unavailable: ${node.type}`,
				{ nodeId: node.id }
			));
		} else {
			definitions.set(node.id, definition);
		}
	}
	return definitions;
}

function validateOutputs(graph, nodes, definitions, diagnostics) {
	for (const [name, output] of Object.entries(graph.outputs)) {
		const node = nodes.get(output.nodeId);
		const outputSocket = node
			? universalDefinitionSocket(definitions.get(node.id), "outputs", output.socketId)
			: null;
		if (!node || !outputSocket) {
			diagnostics.push(diagnostic(
				"NODE.GRAPH_OUTPUT_INVALID",
				`Graph output is invalid: ${name}`,
				{ output }
			));
		}
	}
}

export function validateUniversalNodeGraph(input, options = {}) {
	const graph = createUniversalNodeGraph(input);
	const registry = options.definitionRegistry ?? options.registry;
	if (!registry || typeof registry.resolve !== "function") {
		throw new TypeError("Universal graph validation requires a node definition registry.");
	}
	const diagnostics = [];
	const nodes = new Map(graph.nodes.map(node => [node.id, node]));
	const definitions = resolveDefinitions(graph, registry, diagnostics);
	const linkPlans = createUniversalLinkPlans(graph, definitions);
	for (const plan of linkPlans) {
		validateUniversalLinkPlan(plan, nodes, diagnostics);
	}
	validateUniversalIncomingLimits(definitions, linkPlans, diagnostics);
	validateOutputs(graph, nodes, definitions, diagnostics);
	return Object.freeze({
		ok: diagnostics.length === 0,
		graph,
		diagnostics: Object.freeze(diagnostics),
		definitions,
		linkPlans
	});
}
