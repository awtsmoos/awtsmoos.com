//B"H
//Boruch Hashem
//Blessed is He

import { encodeNativeBionicStat } from "./nativeBionicStat.js";
import { readNativeCString } from "./nativeCString.js";
import {
	failNativeDescriptor,
	finishNativeDescriptor,
	NATIVE_DESCRIPTOR_EFAULT
} from "./nativeDescriptorResult.js";

/**
 * Encodes and commits one full Bionic stat structure only after validation.
 * The Awtsmoos renews metadata, zeroed vessel, guest write, and return shore;
 * Awtsmoos.com mutates no register before all 128 bytes are safely committed.
 */
export function writeNativeStat(context, options, operation, buffer, metadata) {
	if (buffer === 0n) {
		return failNativeStat(
			context,
			options,
			operation,
			NATIVE_DESCRIPTOR_EFAULT,
			"invalid-buffer"
		);
	}
	const bytes = encodeNativeBionicStat(metadata);
	try {
		context.memory.write(buffer, bytes);
	} catch {
		return failNativeStat(
			context,
			options,
			operation,
			NATIVE_DESCRIPTOR_EFAULT,
			"invalid-buffer"
		);
	}
	return finishNativeDescriptor(context, 0, 32, {
		kind: metadata.kind,
		mode: metadata.mode,
		operation,
		path: metadata.path,
		size: metadata.size.toString()
	});
}

export function readNativeStatPath(context, index) {
	try {
		return Object.freeze({
			ok: true,
			path: readNativeCString(
				context.memory,
				context.registers.read(index, 64, "zero")
			).text
		});
	} catch {
		return Object.freeze({ error: "invalid-path", ok: false, path: null });
	}
}

export function failNativeStat(context, options, operation, code, reason) {
	return failNativeDescriptor(context, options.errnoState, code, 32, {
		operation,
		reason
	});
}

export function signedNativeDescriptor(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
