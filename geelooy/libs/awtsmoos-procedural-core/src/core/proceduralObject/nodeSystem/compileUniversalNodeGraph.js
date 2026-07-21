// B"H
// Boruch Hashem
// Blessed is He
/** Universal graph intent compiles into the proven typed graph execution runtime. */

import { createTypedGraph } from "../foundation/graphs/createTypedGraph.js";
import { nodeSocketGraphType } from "../nodes/socketTypes.js";
import { validateUniversalNodeGraph } from "./validateUniversalNodeGraph.js";

function linkedInputs(graph) {
	const map = new Map();
	for (const link of graph.links) {
		const key = `${link.to.nodeId}:${link.to.socketId}`;
		if (!map.has(key)) map.set(key, []);
		map.get(key).push(link);
	}
	return map;
}

function inputBinding(node, socket, links) {
	const linked = links.get(`${node.id}:${socket.id}`) ?? [];
	if (linked.length > 1) throw new Error(`Multi-input compilation requires an adapter: ${node.id}.${socket.id}`);
	if (linked.length === 1) return {
		type: nodeSocketGraphType(socket.type),
		source: { kind: "node", nodeId: linked[0].from.nodeId, port: linked[0].from.socketId }
	};
	const value = node.inputs[socket.id];
	if (value && typeof value === "object" && !Array.isArray(value) && typeof value.graphInput === "string") {
		return {
			type: nodeSocketGraphType(socket.type),
			source: { kind: "graph-input", input: value.graphInput }
		};
	}
	return { type: nodeSocketGraphType(socket.type), value: value ?? socket.defaultValue };
}

function graphInputs(inputDefinitions) {
	return Object.fromEntries(Object.entries(inputDefinitions).map(([name, definition]) => [name, {
		...definition,
		type: nodeSocketGraphType(definition.type)
	}]));
}

export function compileUniversalNodeGraph(input, options = {}) {
	const validation = validateUniversalNodeGraph(input, options);
	if (!validation.ok) return Object.freeze({ ok: false, graph: validation.graph, typedGraph: null, diagnostics: validation.diagnostics });
	try {
		const links = linkedInputs(validation.graph);
		const nodes = validation.graph.nodes.map(node => {
			const definition = validation.definitions.get(node.id);
			return {
				id: node.id,
				operation: { name: node.type, version: node.version },
				inputs: Object.fromEntries(definition.inputs.map(socket => [socket.id, inputBinding(node, socket, links)])),
				outputs: Object.fromEntries(definition.outputs.map(socket => [socket.id, nodeSocketGraphType(socket.type)])),
				config: node.config,
				seed: node.seed
			};
		});
		const outputs = Object.fromEntries(Object.entries(validation.graph.outputs).map(([name, output]) => {
			const definition = validation.definitions.get(output.nodeId);
			const socket = definition.outputs.find(candidate => candidate.id === output.socketId);
			return [name, {
				type: nodeSocketGraphType(socket.type),
				source: { kind: "node", nodeId: output.nodeId, port: output.socketId }
			}];
		}));
		const typedGraph = createTypedGraph({
			name: validation.graph.name,
			version: validation.graph.version,
			inputs: graphInputs(validation.graph.inputs),
			outputs,
			nodes,
			resourceBudget: validation.graph.resourceBudget,
			metadata: { universalGraphId: validation.graph.id, kind: validation.graph.kind }
		});
		return Object.freeze({ ok: true, graph: validation.graph, typedGraph, diagnostics: Object.freeze([]) });
	} catch (error) {
		return Object.freeze({
			ok: false,
			graph: validation.graph,
			typedGraph: null,
			diagnostics: Object.freeze([{ code: "NODE.COMPILATION_FAILED", message: error.message }])
		});
	}
}
