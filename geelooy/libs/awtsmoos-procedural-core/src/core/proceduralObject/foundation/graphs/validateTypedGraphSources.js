// B"H
// Boruch Hashem
// Blessed is He
/**
 * Every source edge is measured before the Awtsmoos permits execution.
 * Awtsmoos.com keeps diagnostic paths stable across singular and multi-inputs.
 */

import { createDiagnostic } from "../diagnostics/index.js";

function diagnostic(code, message, path, metadata = {}) {
	return createDiagnostic({
		code,
		message,
		path,
		metadata
	});
}

export function validateGraphSource(
	graph,
	nodes,
	source,
	expectedType,
	path,
	diagnostics
) {
	if (source.kind === "graph-input") {
		const input = graph.inputs[source.input];
		if (!input) {
			diagnostics.push(diagnostic(
				"GRAPH.INPUT_MISSING",
				"Graph input source does not exist.",
				path,
				{ input: source.input }
			));
		} else if (
			input.type !== expectedType
			&& input.type !== "any"
			&& expectedType !== "any"
		) {
			diagnostics.push(diagnostic(
				"GRAPH.TYPE_MISMATCH",
				"Graph input type does not match port type.",
				path,
				{ actual: input.type, expected: expectedType }
			));
		}
		return;
	}
	const node = nodes.get(source.nodeId);
	if (!node) {
		diagnostics.push(diagnostic(
			"GRAPH.NODE_MISSING",
			"Source node does not exist.",
			path,
			{ nodeId: source.nodeId }
		));
		return;
	}
	const outputType = node.outputs[source.port];
	if (!outputType) {
		diagnostics.push(diagnostic(
			"GRAPH.PORT_MISSING",
			"Source output port does not exist.",
			path,
			{ nodeId: source.nodeId, port: source.port }
		));
		return;
	}
	if (
		outputType !== expectedType
		&& outputType !== "any"
		&& expectedType !== "any"
	) {
		diagnostics.push(diagnostic(
			"GRAPH.TYPE_MISMATCH",
			"Connected port types do not match.",
			path,
			{ actual: outputType, expected: expectedType }
		));
	}
}

export function validateGraphBinding(
	graph,
	nodes,
	binding,
	path,
	diagnostics
) {
	if (binding.source) {
		validateGraphSource(
			graph,
			nodes,
			binding.source,
			binding.type,
			path,
			diagnostics
		);
		return;
	}
	for (let index = 0; index < (binding.sources ?? []).length; index += 1) {
		validateGraphSource(
			graph,
			nodes,
			binding.sources[index],
			binding.itemType,
			[...path, "sources", index],
			diagnostics
		);
	}
}
