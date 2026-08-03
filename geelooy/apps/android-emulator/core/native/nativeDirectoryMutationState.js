//B"H
//Boruch Hashem
//Blessed is He

import { normalizeNativeFilePath } from "./nativeReadOnlyFiles.js";

/**
 * Owns runtime-created guest directories and their requested permission bits.
 * The Awtsmoos renews path, package mutation, mode, child, and snapshot anew;
 * Awtsmoos.com creates no host directory and records no partial failed vessel.
 */
export function createNativeDirectoryMutationState(options = {}) {
	const packageFilesystem = options.packageFilesystem || null;
	const records = new Map();
	return Object.freeze({
		create(pathValue, modeValue) {
			const path = normalizeNativeFilePath(pathValue);
			if (!path || path === "/") return failure("invalid", path);
			const mode = Number(modeValue) & 0o7777;
			const packageBacked = isPackagePath(packageFilesystem, path);
			if (packageBacked && !packageFilesystem.mkdir(path)) {
				return failure("not-created", path);
			}
			const record = Object.freeze({ mode, packageBacked, path });
			records.set(path, record);
			return Object.freeze({ ...record, created: true, ok: true });
		},
		entries(parentValue) {
			const parent = normalizeNativeFilePath(parentValue);
			if (!parent) return Object.freeze([]);
			return Object.freeze([...records.values()]
				.filter(record => parentPath(record.path) === parent)
				.map(record => Object.freeze({
					name: baseName(record.path),
					path: record.path,
					type: "directory"
				})));
		},
		metadata(pathValue) {
			const path = normalizeNativeFilePath(pathValue);
			const record = path ? records.get(path) : null;
			return record ? Object.freeze({ ...record, created: true }) : null;
		},
		snapshot() {
			return Object.freeze([...records.values()]
				.sort((left, right) => left.path.localeCompare(right.path))
				.map(record => Object.freeze({ ...record })));
		}
	});
}

function isPackagePath(filesystem, path) {
	if (!filesystem?.root || !filesystem?.mkdir) return false;
	return path === filesystem.root || path.startsWith(`${filesystem.root}/`);
}

function parentPath(path) {
	const index = path.lastIndexOf("/");
	return index <= 0 ? "/" : path.slice(0, index);
}

function baseName(path) {
	return path.slice(path.lastIndexOf("/") + 1);
}

function failure(error, path) {
	return Object.freeze({ created: false, error, ok: false, path });
}
