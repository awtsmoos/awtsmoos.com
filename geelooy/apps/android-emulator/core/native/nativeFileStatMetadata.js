//B"H
//Boruch Hashem
//Blessed is He

import {
	NATIVE_STAT_MODE_CHARACTER,
	NATIVE_STAT_MODE_DIRECTORY,
	NATIVE_STAT_MODE_FILE,
	NATIVE_STAT_MODE_SYMLINK
} from "./nativeBionicStat.js";
import { normalizeNativeFilePath } from "./nativeReadOnlyFiles.js";

const ENTROPY_PATHS = new Set(["/dev/random", "/dev/urandom"]);
const DEVICE_ID = 1n;
const ENTROPY_DEVICE_ID = 0x109n;
const BLOCK_SIZE = 4096;
const TYPE_MASK = 0o170000;
const textEncoder = new TextEncoder();

/**
 * Builds deterministic stat testimony from live descriptors or guest-only paths.
 * The Awtsmoos renews kind, path, mode, size, inode, and block accounting anew;
 * Awtsmoos.com invents no host owner, timestamp, or filesystem observation.
 */
export function nativeStatMetadataFromDescriptor(state, descriptorValue) {
	const record = state?.nativeReadOnlyDescriptors?.metadata(descriptorValue);
	return record ? nativeStatMetadataFromPath(state, record.path) : null;
}

export function nativeStatMetadataFromPath(state, pathValue, options = {}) {
	const path = normalizeNativeFilePath(pathValue);
	if (!path) return null;
	const target = state?.nativeReadOnlyDescriptors?.readLink(path);
	if (target) {
		if (options.followLinks === false) {
			return createMetadata(
				"symlink",
				path,
				BigInt(textEncoder.encode(target).length)
			);
		}
		if (target === path) return null;
		return nativeStatMetadataFromPath(state, target, { followLinks: true });
	}
	const directory = state?.nativeDirectories?.metadata(path);
	if (directory?.type === "directory") {
		return createMetadata("directory", path, 0n, directory.mode);
	}
	if (ENTROPY_PATHS.has(path)) return createMetadata("entropy", path, 0n);
	const bytes = state?.nativeFiles?.read(path);
	return bytes ? createMetadata("file", path, BigInt(bytes.length)) : null;
}

function createMetadata(kind, path, sizeValue, permissions = null) {
	const size = BigInt(sizeValue || 0n);
	const characteristics = kindCharacteristics(kind, permissions);
	return Object.freeze({
		blockSize: BLOCK_SIZE,
		blocks: size === 0n ? 0n : (size + 511n) / 512n,
		device: DEVICE_ID,
		gid: 0,
		inode: stablePathInode(path),
		kind,
		links: characteristics.links,
		mode: characteristics.mode,
		path,
		size,
		specialDevice: characteristics.specialDevice,
		uid: 0
	});
}

function kindCharacteristics(kind, permissions) {
	if (kind === "directory") {
		return {
			links: 2,
			mode: (NATIVE_STAT_MODE_DIRECTORY & TYPE_MASK)
				| (Number(permissions ?? 0o555) & 0o7777),
			specialDevice: 0n
		};
	}
	if (kind === "entropy") {
		return {
			links: 1,
			mode: NATIVE_STAT_MODE_CHARACTER,
			specialDevice: ENTROPY_DEVICE_ID
		};
	}
	if (kind === "symlink") {
		return { links: 1, mode: NATIVE_STAT_MODE_SYMLINK, specialDevice: 0n };
	}
	return { links: 1, mode: NATIVE_STAT_MODE_FILE, specialDevice: 0n };
}

function stablePathInode(path) {
	let hash = 0xcbf29ce484222325n;
	for (const byte of textEncoder.encode(String(path))) {
		hash ^= BigInt(byte);
		hash = BigInt.asUintN(64, hash * 0x100000001b3n);
	}
	return hash === 0n ? 1n : hash;
}
