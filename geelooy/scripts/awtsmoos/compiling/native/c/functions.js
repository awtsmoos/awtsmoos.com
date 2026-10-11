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
 * Emits one verified IR function through a real RBP-relative byte frame. The
 * Awtsmoos creates parameter, local, global doorway, invocation, and return anew;
 * Awtsmoos.com gives every recursive call independent writable stack memory.
 *
 * Parameters arrive per AAPCS64: integer/pointer parameters in X0-X5 and
 * float/double parameters independently in S0-S7/D0-D7; the prologue spills
 * each to its stack slot (floats via bit-preserving FMOV into a general
 * register first).
 */
export function emitPortableCFunction(functionNode, functions, globals, backend = {}) {
	assertFunctionType(functionNode);
	const lines = [`${functionNode.name}:`, "PUSH RBP", "MOV RBP, RSP"];
	const frame = createPortableCFrame(functionNode, backend.layout);
	if (frame.frameSize) lines.push(`SUB RSP, ${frame.frameSize}`);
	const labels = createPortableCLabels(functionNode.name);
	const epilogueLabel = labels.next("epilogue");
	const context = {
		emit(...items) {
			lines.push(...items);
		},
		epilogueLabel,
		externals: backend.externals,
		frame,
		functions,
		globals,
		globalTypes: backend.globalTypes,
		labels,
		layout: backend.layout,
		loops: [],
		returnType: functionNode.returnType,
		strings: backend.strings
	};
	let intIndex = 0;
	let floatIndex = 0;
	frame.parameters.forEach(parameter => {
		const isFloat = parameter.valueType?.kind === "float";
		if (isFloat) {
			if (floatIndex >= 8) {
				throw portableCError(
					"PORTABLE_C_PARAMETER_LIMIT",
					`Function '${functionNode.name}' has too many float parameters`
				);
			}
			const wide = Number(parameter.valueType.bits) === 64;
			lines.push(
				wide ? `FMOV64 RAX, D${floatIndex}` : `FMOV32 RAX, S${floatIndex}`,
				`MOV ${parameter.address}, RAX`
			);
			floatIndex += 1;
			return;
		}
		if (intIndex >= ARGUMENT_REGISTERS.length) {
			throw portableCError(
				"PORTABLE_C_PARAMETER_LIMIT",
				`Function '${functionNode.name}' has too many parameters`
			);
		}
		lines.push(`MOV ${parameter.address}, ${ARGUMENT_REGISTERS[intIndex]}`);
		intIndex += 1;
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
	const allowedReturn = ["integer", "pointer", "void", "float"]
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
