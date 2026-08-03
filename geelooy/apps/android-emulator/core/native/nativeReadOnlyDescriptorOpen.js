//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_DESCRIPTOR_ACCESS } from "./nativeDescriptorFlagState.js";
import {
	createNativeReadOnlyDescription,
	createNativeReadOnlyDescriptorRecord
} from "./nativeReadOnlyDescriptorDescription.js";
import {
	allocateNativeReadOnlyDescriptor,
	NATIVE_OPEN_DIRECTORY,
	nativeReadOnlyFailure,
	validateNativeReadOnlyOpenFlags
} from "./nativeReadOnlyDescriptorRecords.js";
import { normalizeNativeFilePath } from "./nativeReadOnlyFiles.js";

const RANDOM_PATHS = new Set(["/dev/random", "/dev/urandom"]);

/**
 * Creates one shared description and one descriptor record for a guest object.
 * The Awtsmoos renews path, kind, flags, description, and descriptor evidence;
 * Awtsmoos.com opens no host object and never copies bytes for later aliases.
 */
export function openNativeReadOnlyDescriptor(options, pathValue, flagsValue) {
	const path = normalizeNativeFilePath(pathValue);
	const flags = Number(flagsValue) >>> 0;
	if (!path) return nativeReadOnlyFailure("invalid");
	const validation = validateNativeReadOnlyOpenFlags(flags);
	if (validation) return nativeReadOnlyFailure(validation);
	const entries = options.directories?.entries(path);
	const wantsDirectory = (flags & NATIVE_OPEN_DIRECTORY) !== 0;
	const random = RANDOM_PATHS.has(path);
	const bytes = random ? null : options.files?.read(path);
	if (wantsDirectory && !entries) {
		return nativeReadOnlyFailure(bytes ? "not-directory" : "not-found");
	}
	if (!wantsDirectory && !random && !bytes && !entries) {
		return nativeReadOnlyFailure("not-found");
	}
	const descriptor = allocateNativeReadOnlyDescriptor(
		options.records,
		options.base,
		options.capacity
	);
	if (descriptor === null) return nativeReadOnlyFailure("capacity");
	const kind = entries ? "directory" : random ? "entropy" : "file";
	const description = createNativeReadOnlyDescription({
		bytes,
		flags,
		kind,
		path
	});
	options.records.set(
		descriptor,
		createNativeReadOnlyDescriptorRecord(descriptor, description)
	);
	options.descriptorFlags?.create(descriptor, {
		accessMode: NATIVE_DESCRIPTOR_ACCESS.READ_ONLY,
		flags
	});
	return Object.freeze({ descriptor, flags, kind, ok: true, path });
}
