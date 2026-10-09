//B"H
//Boruch Hashem
//Blessed is He

import { ARGUMENT_REGISTERS, FLOAT_ARGUMENT_REGISTERS } from "./frame.js";
import { portableCError } from "./errors.js";

/**
 * Emits calls through stack-preserved argument evaluation, following AAPCS64
 * register assignment: integer/pointer arguments fill X0-X5 in order while
 * float/double arguments independently fill S0-S7/D0-D7 in order; float
 * returns arrive in S0/D0. Each argument is passed by its own expression
 * type (the IR carries no extern signatures), so `glClearColor(0.2f, ...)`
 * places bit patterns in S0-S3 exactly like the platform expects.
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
	// Indirect call: the callee is an expression (function pointer). Evaluate
	// it first so nested argument calls cannot clobber the target address,
	// then run the standard argument shuffle and branch to the register.
	if (node.calleeKind === "indirect") {
		emitExpression(node.callee, context);
		context.emit("PUSH RAX");
		emitCallArguments(node, context, emitExpression);
		context.emit("POP R10", "CALL R10");
	} else {
		emitCallArguments(node, context, emitExpression);
		context.emit(`CALL ${node.callee}`);
	}
	// Float/double results arrive in S0/D0; move the bits into RAX so the
	// caller keeps the single-register value convention.
	if (node.valueType?.kind === "float") {
		context.emit(Number(node.valueType.bits) === 64
			? "FMOV64 RAX, D0"
			: "FMOV32 RAX, S0");
	}
}

function emitCallArguments(node, context, emitExpression) {
	const targets = [];
	let intIndex = 0;
	let floatIndex = 0;
	for (const argument of node.arguments) {
		if (argument?.valueType?.kind === "float") {
			targets.push({
				bits: Number(argument.valueType.bits) === 64 ? 64 : 32,
				float: true,
				index: floatIndex++
			});
		} else {
			targets.push({ float: false, index: intIndex++ });
		}
	}
	if (intIndex > ARGUMENT_REGISTERS.length) {
		throw portableCError(
			"PORTABLE_C_ARGUMENT_LIMIT",
			`Call '${node.callee}' has ${intIndex} integer arguments`
		);
	}
	if (floatIndex > FLOAT_ARGUMENT_REGISTERS.length) {
		throw portableCError(
			"PORTABLE_C_ARGUMENT_LIMIT",
			`Call '${node.callee}' has ${floatIndex} float arguments`
		);
	}
	for (const argument of node.arguments) {
		emitExpression(argument, context);
		context.emit("PUSH RAX");
	}
	for (let index = node.arguments.length - 1; index >= 0; index -= 1) {
		const target = targets[index];
		if (target.float) {
			context.emit(
				"POP RAX",
				target.bits === 64
					? `FMOV64 D${target.index}, RAX`
					: `FMOV32 S${target.index}, RAX`
			);
		} else {
			context.emit(`POP ${ARGUMENT_REGISTERS[target.index]}`);
		}
	}
}
