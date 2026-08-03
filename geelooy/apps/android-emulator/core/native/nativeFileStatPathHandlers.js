//B"H
//Boruch Hashem
//Blessed is He

import {
	NATIVE_DESCRIPTOR_EFAULT,
	NATIVE_DESCRIPTOR_EINVAL
} from "./nativeDescriptorResult.js";
import { resolveNativeAtStatMetadata } from "./nativeFileStatAtMetadata.js";
import { nativeStatMetadataFromPath } from "./nativeFileStatMetadata.js";
import {
	failNativeStat,
	readNativeStatPath,
	writeNativeStat
} from "./nativeFileStatWrite.js";

const ENOENT = 2;
const AT_SYMLINK_NOFOLLOW = 0x100;
const AT_EMPTY_PATH = 0x1000;
const ALLOWED_AT_FLAGS = AT_SYMLINK_NOFOLLOW | AT_EMPTY_PATH;

/**
 * Executes stat/lstat and fstatat aliases over normalized guest-only paths.
 * The Awtsmoos renews path, link policy, dirfd, metadata, and Bionic byte shore;
 * Awtsmoos.com follows no host symlink and resolves no host current directory.
 */
export function handleNativePathStat(context, options, operation) {
	const input = readNativeStatPath(context, 0);
	if (!input.ok) {
		return failNativeStat(
			context,
			options,
			operation,
			NATIVE_DESCRIPTOR_EFAULT,
			input.error
		);
	}
	const metadata = nativeStatMetadataFromPath(options.state, input.path, {
		followLinks: !operation.startsWith("lstat")
	});
	if (!metadata) {
		return failNativeStat(context, options, operation, ENOENT, "not-found");
	}
	return writeNativeStat(
		context,
		options,
		operation,
		context.registers.read(1, 64, "zero"),
		metadata
	);
}

export function handleNativeAtStat(context, options, operation) {
	const input = readNativeStatPath(context, 1);
	if (!input.ok) {
		return failNativeStat(
			context,
			options,
			operation,
			NATIVE_DESCRIPTOR_EFAULT,
			input.error
		);
	}
	const flags = Number(context.registers.read(3, 32, "zero"));
	if ((flags & ~ALLOWED_AT_FLAGS) !== 0) {
		return failNativeStat(
			context,
			options,
			operation,
			NATIVE_DESCRIPTOR_EINVAL,
			"invalid-flags"
		);
	}
	const metadata = resolveNativeAtStatMetadata(
		options.state,
		context.registers.read(0, 64, "zero"),
		input.path,
		(flags & AT_SYMLINK_NOFOLLOW) === 0,
		input.path === "" && (flags & AT_EMPTY_PATH) !== 0
	);
	if (metadata.error) {
		return failNativeStat(
			context,
			options,
			operation,
			metadata.code,
			metadata.error
		);
	}
	return writeNativeStat(
		context,
		options,
		operation,
		context.registers.read(2, 64, "zero"),
		metadata
	);
}
