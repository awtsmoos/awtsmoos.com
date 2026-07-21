// B"H
// Boruch Hashem
// Blessed is He
/** Validation proves every node, socket, and link before execution is permitted. */

import { createDiagnostic } from "../foundation/diagnostics/index.js";
import { planSocketConnection } from "../nodes/planSocketConnection.js";
import { createUniversalNodeGraph } from "./createUniversalNodeGraph.js";

function diagnostic(code, message, metadata = {}) {
	return createDiagnostic({ code, message, metadata });
}

function socket(definition, direction, id) {
	return definition?.[direction]?.find(candidate => candidate.id === id) ?? null;
}

export function validateUniversalNodeGraph(input, options = {}) {
	const graph = createUniversalNodeGraph(input);
	const registry = options.definitionRegistry ?? options.registry;
	if (!registry || typeof registry.resolve !== "function") {
		throw new TypeError("Universal graph validation requires a node definition registry.");
	}
	const diagnostics = [];
	const nodes = new Map(graph.nodes.map(node => [node.id, node]));
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
	const incoming = new Map();
	for (const link of graph.links) {
		const sourceNode = nodes.get(link.from.nodeId);
		const targetNode = nodes.get(link.to.nodeId);
		if (!sourceNode || !targetNode) {
			diagnostics.push(diagnostic("NODE.LINK_NODE_MISSING", "A link references a missing node.", { link }));
			continue;
		}
		const output = socket(definitions.get(sourceNode.id), "outputs", link.from.socketId);
		const inputSocket = socket(definitions.get(targetNode.id), "inputs", link.to.socketId);
		if (!output || !inputSocket) {
			diagnostics.push(diagnostic("NODE.LINK_SOCKET_MISSING", "A link references a missing socket.", { link }));
			continue;
		}
		const plan = planSocketConnection(output, inputSocket);
		if (!plan.compatible) {
			diagnostics.push(diagnostic("NODE.LINK_INCOMPATIBLE", plan.reason, { link, plan }));
		}
		const key = `${targetNode.id}:${inputSocket.id}`;
		incoming.set(key, (incoming.get(key) ?? 0) + 1);
		if (!inputSocket.multiInput && incoming.get(key) > 1) {
			diagnostics.push(diagnostic("NODE.MULTIPLE_INPUT_LINKS", "A single-input socket has multiple links.", { link }));
		}
	}
	for (const [name, output] of Object.entries(graph.outputs)) {
		const node = nodes.get(output.nodeId);
		if (!node || !socket(definitions.get(node.id), "outputs", output.socketId)) {
			diagnostics.push(diagnostic("NODE.GRAPH_OUTPUT_INVALID", `Graph output is invalid: ${name}`, { output }));
		}
	}
	return Object.freeze({
		ok: diagnostics.length === 0,
		graph,
		diagnostics: Object.freeze(diagnostics),
		definitions
	});
}
