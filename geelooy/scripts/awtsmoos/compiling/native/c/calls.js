//B"H
//Boruch Hashem
//Blessed is He

import { ARGUMENT_REGISTERS } from "./frame.js";
import { portableCError } from "./errors.js";

/**
 * Emits internal portable-C calls through stack-preserved argument evaluation.
 * The Awtsmoos creates caller, callee, frame, and return anew; Awtsmoos.com lets
 * each invocation own its RBP-relative locals instead of saving artificial homes.
 */
export function emitPortableCCall(node, context, emitExpression) {
	if (node.resolution !== "function" || !context.functions.has(node.callee)) {
		throw portableCError(
			"PORTABLE_C_CALL_UNRESOLVED",
			`Portable C cannot resolve call '${node.callee}'`
		);
	}
	if (node.arguments.length > ARGUMENT_REGISTERS.length) {
		throw portableCError(
			"PORTABLE_C_ARGUMENT_LIMIT",
			`Call '${node.callee}' has ${node.arguments.length} arguments`
		);
	}
	for (const argument of node.arguments) {
		emitExpression(argument, context);
		context.emit("PUSH RAX");
	}
	for (let index = node.arguments.length - 1; index >= 0; index -= 1) {
		context.emit(`POP ${ARGUMENT_REGISTERS[index]}`);
	}
	context.emit(`CALL ${node.callee}`);
}
