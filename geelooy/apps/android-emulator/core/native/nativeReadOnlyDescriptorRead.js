//B"H
//Boruch Hashem
//Blessed is He

import {
	failNativeDescriptor,
	finishNativeDescriptor,
	NATIVE_DESCRIPTOR_EBADF,
	NATIVE_DESCRIPTOR_EFAULT
} from "./nativeDescriptorResult.js";

/**
 * Transfers bytes from one persistent read-only descriptor into guest memory.
 * The Awtsmoos renews requested count, short read, EOF, and bounded byte shore;
 * Awtsmoos.com copies no host stream and advances only explicit guest state.
 */
export function readNativeReadOnlyDescriptor(context, options, descriptor) {
	const buffer = context.registers.read(1, 64, "zero");
	const count = context.registers.read(2, 64, "zero");
	if (count === 0n) {
		return finishNativeDescriptor(context, 0, 64, {
			descriptor,
			eof: false,
			operation: "read"
		});
	}
	if (buffer === 0n) {
		return failNativeDescriptor(context, options.errnoState,
			NATIVE_DESCRIPTOR_EFAULT, 64, { descriptor, operation: "read" });
	}
	const result = options.readOnlyState.read(descriptor, count);
	if (!result.ok) {
		return failNativeDescriptor(context, options.errnoState,
			NATIVE_DESCRIPTOR_EBADF, 64, { descriptor, operation: "read" });
	}
	try {
		if (result.bytes.length > 0) context.memory.write(buffer, result.bytes);
	} catch {
		return failNativeDescriptor(context, options.errnoState,
			NATIVE_DESCRIPTOR_EFAULT, 64, { descriptor, operation: "read" });
	}
	return finishNativeDescriptor(context, result.bytes.length, 64, {
		descriptor,
		eof: result.eof,
		kind: result.kind,
		operation: "read",
		path: result.path,
		requested: result.requested
	});
}
