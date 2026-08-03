//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_AT_FDCWD, resolveNativeAtPath } from "./nativeAtPath.js";
import { readNativeCString } from "./nativeCString.js";
import {
	failNativeDescriptor,
	finishNativeDescriptor,
	NATIVE_DESCRIPTOR_EBADF,
	NATIVE_DESCRIPTOR_EFAULT,
	NATIVE_DESCRIPTOR_EINVAL
} from "./nativeDescriptorResult.js";

const ENOENT = 2;
const EEXIST = 17;
const ENOTDIR = 20;

/**
 * Registers mkdir/mkdirat over the mutable guest directory catalog.
 * The Awtsmoos renews dirfd, path, permissions, errno, and returning shore;
 * Awtsmoos.com creates no host directory and leaves no partial failed child.
 */
export function registerNativeDirectoryMutationHandlers(registry, options = {}) {
	registry.register("mkdir", context => handleNativeMkdir(
		context,
		options,
		false
	));
	registry.register("mkdirat", context => handleNativeMkdir(
		context,
		options,
		true
	));
}

function handleNativeMkdir(context, options, atOperation) {
	const operation = atOperation ? "mkdirat" : "mkdir";
	const pathIndex = atOperation ? 1 : 0;
	const modeIndex = atOperation ? 2 : 1;
	let input;
	try {
		input = readNativeCString(
			context.memory,
			context.registers.read(pathIndex, 64, "zero")
		).text;
	} catch {
		return fail(context, options, operation, NATIVE_DESCRIPTOR_EFAULT, "invalid-path");
	}
	const directory = atOperation
		? context.registers.read(0, 64, "zero")
		: BigInt.asUintN(32, BigInt(NATIVE_AT_FDCWD));
	const resolved = resolveNativeAtPath(
		options.state?.nativeReadOnlyDescriptors,
		directory,
		input
	);
	if (!resolved.ok) {
		const code = resolved.error === "bad-fd"
			? NATIVE_DESCRIPTOR_EBADF
			: NATIVE_DESCRIPTOR_EINVAL;
		return fail(context, options, operation, code, resolved.error);
	}
	const mode = Number(context.registers.read(modeIndex, 32, "zero")) & 0o7777;
	const created = options.state?.nativeDirectories?.create(resolved.path, mode)
		|| Object.freeze({ error: "invalid", ok: false });
	if (!created.ok) {
		return fail(
			context,
			options,
			operation,
			errorCode(created.error),
			created.error
		);
	}
	return finishNativeDescriptor(context, 0, 32, {
		created: true,
		mode,
		operation,
		packageBacked: created.packageBacked,
		path: created.path
	});
}

function errorCode(error) {
	if (error === "exists") return EEXIST;
	if (error === "not-found") return ENOENT;
	if (error === "not-directory") return ENOTDIR;
	return NATIVE_DESCRIPTOR_EINVAL;
}

function fail(context, options, operation, code, reason) {
	return failNativeDescriptor(context, options.errnoState, code, 32, {
		operation,
		reason
	});
}
