// B"H
// Boruch Hashem
// Blessed is He
/** Universal intent executes exact links locally and preserves conversion links for adapters. */

import { createTypedGraph } from "../foundation/graphs/createTypedGraph.js";
import { nodeSocketGraphType } from "../nodes/socketTypes.js";
import {
	linkedUniversalInputs,
	universalGraphInputs,
	universalInputBinding
} from "./compileUniversalNodeBindings.js";
import { validateUniversalNodeGraph } from "./validateUniversalNodeGraph.js";

function typedNodes(validation, links) {
	return validation.graph.nodes.map(node => {
		const definition = validation.definitions.get(node.id);
		return {
			id: node.id,
			operation: { name: node.type, version: node.version },
			inputs: Object.fromEntries(definition.inputs.map(socket => [
				socket.id,
				universalInputBinding(node, socket, links)
			])),
			outputs: Object.fromEntries(definition.outputs.map(socket => [
				socket.id,
				nodeSocketGraphType(socket.type)
			])),
			config: node.config,
			seed: node.seed
		};
	});
}

function typedOutputs(validation) {
	return Object.fromEntries(Object.entries(validation.graph.outputs).map(([name, output]) => {
		const definition = validation.definitions.get(output.nodeId);
		const socket = definition.outputs.find(candidate => candidate.id === output.socketId);
		return [name, {
			type: nodeSocketGraphType(socket.type),
			source: { kind: "node", nodeId: output.nodeId, port: output.socketId }
		}];
	}));
}

function failure(validation, code, message, extra = {}) {
	return Object.freeze({
		ok: false,
		graph: validation.graph,
		typedGraph: null,
		linkPlans: validation.linkPlans,
		requiresAdapterConversions: false,
		diagnostics: Object.freeze([{ code, message }]),
		...extra
	});
}

export function compileUniversalNodeGraph(input, options = {}) {
	const validation = validateUniversalNodeGraph(input, options);
	if (!validation.ok) {
		return Object.freeze({
			ok: false,
			graph: validation.graph,
			typedGraph: null,
			linkPlans: validation.linkPlans,
			requiresAdapterConversions: false,
			diagnostics: validation.diagnostics
		});
	}
	const conversionPlans = Object.freeze(validation.linkPlans.filter(plan => (
		plan.active && plan.conversion !== null
	)));
	if (conversionPlans.length > 0) {
		return failure(
			validation,
			"NODE.CONVERSION_EXECUTOR_REQUIRED",
			"One or more links require adapter conversion before local execution.",
			{ requiresAdapterConversions: true, conversionPlans }
		);
	}
	try {
		const links = linkedUniversalInputs(validation.graph);
		const typedGraph = createTypedGraph({
			name: validation.graph.name,
			version: validation.graph.version,
			inputs: universalGraphInputs(validation.graph.inputs),
			outputs: typedOutputs(validation),
			nodes: typedNodes(validation, links),
			resourceBudget: validation.graph.resourceBudget,
			metadata: {
				universalGraphId: validation.graph.id,
				kind: validation.graph.kind,
				linkPlans: validation.linkPlans
			}
		});
		return Object.freeze({
			ok: true,
			graph: validation.graph,
			typedGraph,
			linkPlans: validation.linkPlans,
			requiresAdapterConversions: false,
			conversionPlans,
			diagnostics: Object.freeze([])
		});
	} catch (error) {
		return failure(validation, "NODE.COMPILATION_FAILED", error.message);
	}
}
