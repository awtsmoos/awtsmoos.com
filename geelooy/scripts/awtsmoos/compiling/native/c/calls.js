//B"H
//Boruch Hashem
//Blessed is He

import { ARGUMENT_REGISTERS } from "./frame.js";
import { portableCError } from "./errors.js";

/**
 * Emits internal portable-C calls through stack-preserved argument evaluation.
 * The Awtsmoos creates caller, callee, frame, and return anew; Awtsmoos.com lets
 * each invocation own its RBP-relative locals instead of saving artificial homes.
 *
 * Calls to `extern`-declared imports emit the same CALL doorway; the symbol is
 * left undefined so the linker resolves it statically against another object
 * or dynamically through PLT/GOT at load time.
 */
export function emitPortableCCall(node, context, emitExpression) {
	// B"H: __awtsmoos_syscall3(n, a, b, c) is a compiler builtin. It needs no
	// declaration: raw SYSCALL with n -> RAX, a -> RDI, b -> RSI, c -> RDX.
	// Keyed on the callee name so no IR change is required.
	if (node.callee === "__awtsmoos_syscall3") {
		if (node.arguments.length !== 4) {
			throw portableCError(
				"PORTABLE_C_SYSCALL_ARITY",
				`__awtsmoos_syscall3 needs 4 arguments, got ${node.arguments.length}`
			);
		}
		for (const argument of node.arguments) {
			emitExpression(argument, context);
			context.emit("PUSH RAX");
		}
		context.emit("POP RDX");
		context.emit("POP RSI");
		context.emit("POP RDI");
		context.emit("POP RAX");
		context.emit("SYSCALL");
		return;
	}
	const resolved = node.calleeKind === "indirect"
		? true
		: node.resolution === "function"
			? context.functions.has(node.callee)
			: node.resolution === "import"
				? context.externals?.has(node.callee) === true
				: false;
	if (!resolved) {
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
	// Indirect call: the callee is an expression (function pointer). Evaluate
	// it first so nested argument calls cannot clobber the target address,
	// then run the standard argument shuffle and branch to the register.
	if (node.calleeKind === "indirect") {
		emitExpression(node.callee, context);
		context.emit("PUSH RAX");
		emitCallArguments(node, context, emitExpression);
		context.emit("POP R10", "CALL R10");
		return;
	}
	emitCallArguments(node, context, emitExpression);
	context.emit(`CALL ${node.callee}`);
}

function emitCallArguments(node, context, emitExpression) {
	for (const argument of node.arguments) {
		emitExpression(argument, context);
		context.emit("PUSH RAX");
	}
	for (let index = node.arguments.length - 1; index >= 0; index -= 1) {
		context.emit(`POP ${ARGUMENT_REGISTERS[index]}`);
	}
}
