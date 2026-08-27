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
import {
	evaluateNativeFileAccess,
	NATIVE_ACCESS_ALLOWED_MODE
} from "./nativeFileAccessPermissions.js";
import { nativeStatMetadataFromPath } from "./nativeFileStatMetadata.js";

const ENOENT = 2;
const EACCES = 13;
const AT_SYMLINK_NOFOLLOW = 0x100;
const AT_EACCESS = 0x200;
const ALLOWED_FLAGS = AT_SYMLINK_NOFOLLOW | AT_EACCESS;

/**
 * Registers deterministic access/faccessat checks over frozen guest metadata.
 * The Awtsmoos renews dirfd, path, requested mode, permissions, and return shore;
 * Awtsmoos.com asks no host identity and consults no host filesystem permission.
 */
export function registerNativeFileAccessHandlers(registry, options = {}) {
	registry.register("access", context => handleNativeAccess(
		context,
		options,
		false
	));
	registry.register("faccessat", context => handleNativeAccess(
		context,
		options,
		true
	));
}

function handleNativeAccess(context, options, atOperation) {
	const operation = atOperation ? "faccessat" : "access";
	const pathIndex = atOperation ? 1 : 0;
	const modeIndex = atOperation ? 2 : 1;
	const mode = Number(context.registers.read(modeIndex, 32, "zero"));
	const flags = atOperation
		? Number(context.registers.read(3, 32, "zero"))
		: 0;
	if ((mode & ~NATIVE_ACCESS_ALLOWED_MODE) !== 0) {
		return fail(context, options, operation, NATIVE_DESCRIPTOR_EINVAL, "invalid-mode");
	}
	if ((flags & ~ALLOWED_FLAGS) !== 0) {
		return fail(context, options, operation, NATIVE_DESCRIPTOR_EINVAL, "invalid-flags");
	}
	const input = readAccessPath(context, pathIndex);
	if (!input.ok) {
		return fail(context, options, operation, NATIVE_DESCRIPTOR_EFAULT, input.error);
	}
	const directory = atOperation
		? context.registers.read(0, 64, "zero")
		: BigInt.asUintN(32, BigInt(NATIVE_AT_FDCWD));
	const resolved = resolveNativeAtPath(
		options.state?.nativeReadOnlyDescriptors,
		directory,
		input.path
	);
	if (!resolved.ok) {
		const code = resolved.error === "bad-fd"
			? NATIVE_DESCRIPTOR_EBADF
			: NATIVE_DESCRIPTOR_EINVAL;
		return fail(context, options, operation, code, resolved.error);
	}
	const metadata = nativeStatMetadataFromPath(options.state, resolved.path, {
		followLinks: (flags & AT_SYMLINK_NOFOLLOW) === 0
	});
	if (!metadata) return fail(context, options, operation, ENOENT, "not-found");
	const access = evaluateNativeFileAccess(metadata.mode, mode);
	if (!access.granted) {
		return fail(context, options, operation, EACCES, "permission-denied");
	}
	return finishNativeDescriptor(context, 0, 32, {
		effectiveAccess: (flags & AT_EACCESS) !== 0,
		flags,
		granted: true,
		kind: metadata.kind,
		mode,
		operation,
		path: metadata.path,
		permissions: access.permissions
	});
}

function readAccessPath(context, index) {
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

function fail(context, options, operation, code, reason) {
	return failNativeDescriptor(context, options.errnoState, code, 32, {
		operation,
		reason
	});
}
