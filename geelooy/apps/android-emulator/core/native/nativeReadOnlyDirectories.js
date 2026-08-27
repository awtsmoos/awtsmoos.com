//B"H
//Boruch Hashem
//Blessed is He

import {
	createNativePlatformDirectories,
	freezeNativeDirectoryEntries,
	nativeDirectoryParentPath,
	nativePackageDirectoryEntries,
	nativePlatformNodeType
} from "./nativeDirectoryCatalogSupport.js";
import { createNativeDirectoryMutationState } from "./nativeDirectoryMutationState.js";
import { normalizeNativeFilePath } from "./nativeReadOnlyFiles.js";

/**
 * Creates one catalog over package, seeded, dynamic, and runtime directories.
 * The Awtsmoos renews parent, child, mutation, mode, and merged testimony anew;
 * Awtsmoos.com creates no host directory and never duplicates one guest child.
 */
export function createNativeReadOnlyDirectories(options = {}) {
	const packageFilesystem = options.packageFilesystem || null;
	const platformDirectories = createNativePlatformDirectories(options.platformFiles);
	const dynamicEntries = options.dynamicEntries;
	const mutations = options.mutations || createNativeDirectoryMutationState({
		packageFilesystem
	});
	const catalog = Object.freeze({
		create(pathValue, modeValue) {
			const path = normalizeNativeFilePath(pathValue);
			if (!path || path === "/") return failure("invalid", path);
			if (catalog.metadata(path)) return failure("exists", path);
			const parentMetadata = catalog.metadata(nativeDirectoryParentPath(path));
			if (!parentMetadata) return failure("not-found", path);
			if (parentMetadata.type !== "directory") return failure("not-directory", path);
			if (parentMetadata.source === "dynamic") return failure("invalid", path);
			return mutations.create(path, modeValue);
		},
		entries(pathValue) {
			const path = normalizeNativeFilePath(pathValue);
			if (!path) return null;
			const dynamic = dynamicEntries?.(path);
			if (dynamic) return freezeNativeDirectoryEntries(dynamic);
			const packageEntries = nativePackageDirectoryEntries(packageFilesystem, path);
			const platformEntries = platformDirectories.get(path)?.values() || [];
			const runtimeEntries = mutations.entries(path);
			const exists = packageEntries !== null
				|| platformDirectories.has(path)
				|| mutations.metadata(path);
			return exists ? freezeNativeDirectoryEntries([
				...packageEntries || [],
				...platformEntries,
				...runtimeEntries
			]) : null;
		},
		metadata(pathValue) {
			const path = normalizeNativeFilePath(pathValue);
			if (!path) return null;
			const runtime = mutations.metadata(path);
			if (runtime) return Object.freeze({
				...runtime,
				source: "runtime",
				type: "directory"
			});
			if (dynamicEntries?.(path)) return directoryMetadata(path, "dynamic");
			if (packageFilesystem?.isDirectory?.(path)) {
				return directoryMetadata(path, "package");
			}
			if (packageFilesystem?.isFile?.(path)) {
				return Object.freeze({ path, source: "package", type: "file" });
			}
			const type = nativePlatformNodeType(platformDirectories, path);
			return type ? Object.freeze({
				mode: 0o555,
				path,
				source: "platform",
				type
			}) : null;
		},
		snapshot() {
			return Object.freeze({
				createdDirectories: mutations.snapshot(),
				packageRoot: packageFilesystem?.root || null,
				platformDirectories: Object.freeze([...platformDirectories.keys()].sort())
			});
		}
	});
	return catalog;
}

function directoryMetadata(path, source) {
	return Object.freeze({ mode: 0o555, path, source, type: "directory" });
}

function failure(error, path) {
	return Object.freeze({ created: false, error, ok: false, path });
}
