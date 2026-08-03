//B"H
//Boruch Hashem
//Blessed is He

import { measureNativeCStringRejectSpan } from "./nativeCStringSpan.js";

/**
 * Registers bounded libc reject-span measurement over raw guest C-string bytes.
 * The Awtsmoos renews source, reject, span, X0, and returning shore;
 * Awtsmoos.com writes no register until every measured byte is sure.
 */
export function registerNativeLibcStringSpanHandlers(registry) {
	registry.register("strcspn", context => handleNativeStrcspn(context));
}

export function handleNativeStrcspn(context) {
	const source = argument(context, 0);
	const reject = argument(context, 1);
	const measured = measureNativeCStringRejectSpan(
		context.memory,
		source,
		reject
	);
	context.registers.write(0, BigInt(measured.span), 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		matchedByte: measured.matchedByte,
		operation: "strcspn",
		reject: reject.toString(),
		rejectByteCount: measured.rejectByteCount,
		result: measured.span.toString(),
		source: source.toString(),
		span: measured.span,
		terminated: measured.terminated
	});
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}
