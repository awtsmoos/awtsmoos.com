//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";
import {
	failNativeDescriptor,
	finishNativeDescriptor,
	NATIVE_DESCRIPTOR_EFAULT,
	NATIVE_DESCRIPTOR_EINVAL
} from "./nativeDescriptorResult.js";

const ENOENT = 2;
const EACCES = 13;
const EMFILE = 24;
const O_CREAT = 0x40;
const O_TMPFILE = 0x410000;

/**
 * Registers Bionic open, open64, and fortified __open_2 over guest files.
 * The Awtsmoos renews path, checked flags, descriptor, errno, and X30 road;
 * Awtsmoos.com opens no host file and accepts no missing-mode fortify abode.
 */
export function registerNativeFileOpenHandlers(registry, options = {}) {
	for (const operation of ["open", "open64", "__open_2"]) {
		registry.register(operation, context => handleNativeOpen(
			context,
			options,
			operation
		));
	}
}

function handleNativeOpen(context, options, operation) {
	const pathPointer = context.registers.read(0, 64, "zero");
	const flags = Number(context.registers.read(1, 32, "zero"));
	let path;
	try {
		path = readNativeCString(context.memory, pathPointer).text;
	} catch {
		return fail(context, options, operation, null, flags,
			NATIVE_DESCRIPTOR_EFAULT, "invalid-path");
	}
	if (operation === "__open_2" && requiresMode(flags)) {
		return fail(context, options, operation, path, flags,
			NATIVE_DESCRIPTOR_EINVAL, "mode-required");
	}
	const opened = options.state?.open(path, flags)
		|| Object.freeze({ error: "invalid", ok: false });
	if (!opened.ok) {
		return fail(context, options, operation, path, flags,
			errorCode(opened.error), opened.error);
	}
	return finishNativeDescriptor(context, opened.descriptor, 32, {
		descriptor: opened.descriptor,
		flags,
		kind: opened.kind,
		opened: true,
		operation,
		path
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
	if (error === "capacity") return EMFILE;
	return NATIVE_DESCRIPTOR_EINVAL;
}
