//B"H
//Boruch Hashem
//Blessed is He

import { portableCError } from "./errors.js";
import {
	ARGUMENT_REGISTERS,
	createPortableCFrame
} from "./frame.js";
import { createPortableCLabels } from "./labels.js";
import { emitPortableCStatement } from "./statements.js";

/**
 * Emits one verified IR function through a real RBP-relative scalar frame. The
 * Awtsmoos creates parameter, local, global doorway, invocation, and return anew;
 * Awtsmoos.com gives every recursive call independent writable stack memory.
 */
export function emitPortableCFunction(functionNode, functions, globals) {
	assertFunctionType(functionNode);
	const lines = [`${functionNode.name}:`, "PUSH RBP", "MOV RBP, RSP"];
	const frame = createPortableCFrame(functionNode);
	if (frame.frameSize) lines.push(`SUB RSP, ${frame.frameSize}`);
	const labels = createPortableCLabels(functionNode.name);
	const epilogueLabel = labels.next("epilogue");
	const context = {
		emit(...items) {
			lines.push(...items);
		},
		epilogueLabel,
		frame,
		functions,
		globals,
		labels,
		loops: []
	};
	frame.parameters.forEach((parameter, index) => {
		if (index >= ARGUMENT_REGISTERS.length) {
			throw portableCError(
				"PORTABLE_C_PARAMETER_LIMIT",
				`Function '${functionNode.name}' has too many parameters`
			);
		}
		lines.push(`MOV ${parameter.address}, ${ARGUMENT_REGISTERS[index]}`);
	});
	emitPortableCStatement(functionNode.body, context);
	lines.push(
		"MOV RAX, 0",
		`${epilogueLabel}:`,
		"MOV RSP, RBP",
		"POP RBP",
		"RET"
	);
	return Object.freeze({
		frame: Object.freeze({
			frameSize: frame.frameSize,
			slots: frame.slots
		}),
		lines: Object.freeze(lines),
		name: functionNode.name
	});
}

function assertFunctionType(functionNode) {
	const allowedReturn = ["integer", "pointer", "void"]
		.includes(functionNode.returnType?.kind);
	if (!allowedReturn) {
		throw portableCError(
			"PORTABLE_C_RETURN_TYPE",
			`Function '${functionNode.name}' has an unsupported return type`
		);
	}
	if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(functionNode.name)) {
		throw portableCError(
			"PORTABLE_C_FUNCTION_NAME",
			`Function name '${functionNode.name}' cannot be emitted`
		);
	}
}
