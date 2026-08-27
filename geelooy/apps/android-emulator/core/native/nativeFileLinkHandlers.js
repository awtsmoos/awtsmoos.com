//B"H
//Boruch Hashem
//Blessed is He

import { resolveNativeAtPath, NATIVE_AT_FDCWD } from "./nativeAtPath.js";
import { readNativeCString } from "./nativeCString.js";
import {
	failNativeDescriptor,
	finishNativeDescriptor,
	NATIVE_DESCRIPTOR_EBADF,
	NATIVE_DESCRIPTOR_EFAULT,
	NATIVE_DESCRIPTOR_EINVAL
} from "./nativeDescriptorResult.js";

const ENOENT = 2;
const textEncoder = new TextEncoder();

/**
 * Registers bounded readlink/readlinkat over explicit guest proc-fd targets.
 * The Awtsmoos renews path, target bytes, truncation, errno, and return shore;
 * Awtsmoos.com appends no NUL and consults no host symbolic-link namespace.
 */
export function registerNativeFileLinkHandlers(registry, options = {}) {
	registry.register("readlink", context => handleNativeReadlink(
		context,
		options,
		false
	));
	registry.register("readlinkat", context => handleNativeReadlink(
		context,
		options,
		true
	));
}

function handleNativeReadlink(context, options, atOperation) {
	const operation = atOperation ? "readlinkat" : "readlink";
	const pathIndex = atOperation ? 1 : 0;
	const bufferIndex = atOperation ? 2 : 1;
	const sizeIndex = atOperation ? 3 : 2;
	const directory = atOperation
		? context.registers.read(0, 64, "zero")
		: BigInt.asUintN(32, BigInt(NATIVE_AT_FDCWD));
	let input;
	try {
		input = readNativeCString(
			context.memory,
			context.registers.read(pathIndex, 64, "zero")
		).text;
	} catch {
		return fail(context, options, operation, NATIVE_DESCRIPTOR_EFAULT, "invalid-path");
	}
	const resolved = resolveNativeAtPath(options.state, directory, input);
	if (!resolved.ok) {
		const code = resolved.error === "bad-fd"
			? NATIVE_DESCRIPTOR_EBADF
			: NATIVE_DESCRIPTOR_EINVAL;
		return fail(context, options, operation, code, resolved.error);
	}
	const target = options.state?.readLink(resolved.path);
	if (!target) return fail(context, options, operation, ENOENT, "not-found");
	const buffer = context.registers.read(bufferIndex, 64, "zero");
	const capacity = context.registers.read(sizeIndex, 64, "zero");
	if (capacity === 0n) {
		return fail(context, options, operation, NATIVE_DESCRIPTOR_EINVAL, "zero-size");
	}
	if (buffer === 0n) {
		return fail(context, options, operation, NATIVE_DESCRIPTOR_EFAULT, "invalid-buffer");
	}
	const bytes = textEncoder.encode(target);
	const count = Number(capacity < BigInt(bytes.length) ? capacity : BigInt(bytes.length));
	try {
		context.memory.write(buffer, bytes.slice(0, count));
	} catch {
		return fail(context, options, operation, NATIVE_DESCRIPTOR_EFAULT, "invalid-buffer");
	}
	return finishNativeDescriptor(context, count, 64, {
		operation,
		path: resolved.path,
		target,
		transferred: count,
		truncated: count < bytes.length
	});
}

function fail(context, options, operation, code, reason) {
	return failNativeDescriptor(context, options.errnoState, code, 64, {
		operation,
		reason
	});
}
