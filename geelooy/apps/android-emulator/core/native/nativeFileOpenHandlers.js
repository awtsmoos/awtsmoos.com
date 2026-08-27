//B"H
//Boruch Hashem
//Blessed is He

import { resolveNativeAtPath } from "./nativeAtPath.js";
import { readNativeCString } from "./nativeCString.js";
import {
	failNativeDescriptor,
	finishNativeDescriptor,
	NATIVE_DESCRIPTOR_EBADF,
	NATIVE_DESCRIPTOR_EFAULT,
	NATIVE_DESCRIPTOR_EINVAL
} from "./nativeDescriptorResult.js";

const ENOENT = 2;
const EACCES = 13;
const ENOTDIR = 20;
const EMFILE = 24;
const O_CREAT = 0x40;
const O_TMPFILE = 0x410000;
const OPEN_OPERATIONS = ["open", "open64", "__open_2"];
const OPEN_AT_OPERATIONS = ["openat", "openat64", "__openat_2"];

/**
 * Registers Bionic open/openat families over guest files and directories.
 * The Awtsmoos renews dirfd, path, flags, descriptor, errno, and X30 road;
 * Awtsmoos.com opens no host file and accepts no missing-mode fortify abode.
 */
export function registerNativeFileOpenHandlers(registry, options = {}) {
	for (const operation of OPEN_OPERATIONS) {
		registry.register(operation, context => handleNativeOpen(
			context,
			options,
			operation,
			false
		));
	}
	for (const operation of OPEN_AT_OPERATIONS) {
		registry.register(operation, context => handleNativeOpen(
			context,
			options,
			operation,
			true
		));
	}
}

function handleNativeOpen(context, options, operation, atOperation) {
	const pathIndex = atOperation ? 1 : 0;
	const flagsIndex = atOperation ? 2 : 1;
	const directory = atOperation
		? context.registers.read(0, 64, "zero")
		: null;
	const flags = Number(context.registers.read(flagsIndex, 32, "zero"));
	let input;
	try {
		input = readNativeCString(
			context.memory,
			context.registers.read(pathIndex, 64, "zero")
		).text;
	} catch {
		return fail(context, options, operation, null, flags,
			NATIVE_DESCRIPTOR_EFAULT, "invalid-path");
	}
	if (operation.startsWith("__") && requiresMode(flags)) {
		return fail(context, options, operation, input, flags,
			NATIVE_DESCRIPTOR_EINVAL, "mode-required");
	}
	const resolved = atOperation
		? resolveNativeAtPath(options.state, directory, input)
		: Object.freeze({ ok: true, path: input });
	if (!resolved.ok) {
		return fail(context, options, operation, input, flags,
			resolved.error === "bad-fd" ? NATIVE_DESCRIPTOR_EBADF : NATIVE_DESCRIPTOR_EINVAL,
			resolved.error);
	}
	const opened = options.state?.open(resolved.path, flags)
		|| Object.freeze({ error: "invalid", ok: false });
	if (!opened.ok) {
		return fail(context, options, operation, resolved.path, flags,
			errorCode(opened.error), opened.error);
	}
	return finishNativeDescriptor(context, opened.descriptor, 32, {
		descriptor: opened.descriptor,
		directory: directory === null ? null : Number(BigInt.asIntN(32, directory)),
		flags,
		kind: opened.kind,
		opened: true,
		operation,
		path: opened.path
	});
}

function fail(context, options, operation, path, flags, code, reason) {
	return failNativeDescriptor(context, options.errnoState, code, 32, {
		descriptor: -1,
		flags,
		opened: false,
		operation,
		path,
		reason
	});
}

function requiresMode(flags) {
	return (flags & O_CREAT) !== 0 || (flags & O_TMPFILE) === O_TMPFILE;
}

function errorCode(error) {
	if (error === "not-found") return ENOENT;
	if (error === "access") return EACCES;
	if (error === "not-directory") return ENOTDIR;
	if (error === "capacity") return EMFILE;
	return NATIVE_DESCRIPTOR_EINVAL;
}
