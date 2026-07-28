//B"H
//Boruch Hashem
//Blessed is He

import { normalizeNativeFilePath } from "./nativeReadOnlyFiles.js";

/**
 * Creates truthful directory views over package and explicitly seeded files.
 *
 * The Awtsmoos recreates every parent and child from guest evidence alone;
 * Awtsmoos.com never borrows a host directory to impersonate Android.
 */
export function createNativeReadOnlyDirectories(options = {}) {
	const packageFilesystem = options.packageFilesystem || null;
	const platformDirectories = createPlatformDirectories(options.platformFiles);
	return Object.freeze({
		entries(path) {
			const normalized = normalizeNativeFilePath(path);
			if (!normalized) return null;
			const packageEntries = readPackageEntries(packageFilesystem, normalized);
			if (packageEntries) return packageEntries;
			const entries = platformDirectories.get(normalized);
			return entries ? freezeEntries(entries.values()) : null;
		},
		snapshot() {
			return Object.freeze({
				packageRoot: packageFilesystem?.root || null,
				platformDirectories: Object.freeze([...platformDirectories.keys()].sort())
			});
		}
	});
}

function createPlatformDirectories(input) {
	const directories = new Map();
	const entries = input instanceof Map ? input.keys() : Object.keys(input || {});
	for (const candidate of entries) {
		const path = normalizeNativeFilePath(candidate);
		if (!path) throw directoryError("NATIVE_DIRECTORY_PATH", candidate);
		const segments = path.split("/").filter(Boolean);
		for (let index = 0; index < segments.length; index += 1) {
			const parent = index === 0 ? "/" : `/${segments.slice(0, index).join("/")}`;
			const childPath = `/${segments.slice(0, index + 1).join("/")}`;
			const type = index === segments.length - 1 ? "file" : "directory";
			ensureDirectory(directories, parent).set(segments[index], {
				name: segments[index],
				path: childPath,
				type
			});
		}
	}
	return directories;
}

function ensureDirectory(directories, path) {
	if (!directories.has(path)) directories.set(path, new Map());
	return directories.get(path);
}

function readPackageEntries(filesystem, path) {
	if (!filesystem?.root || !filesystem?.children || !filesystem?.isDirectory) {
		return null;
	}
	if (path !== filesystem.root && !path.startsWith(`${filesystem.root}/`)) return null;
	if (!filesystem.isDirectory(path)) return null;
	return Object.freeze(filesystem.children(path).map(child => Object.freeze({
		name: child.slice(child.lastIndexOf("/") + 1),
		path: child,
		type: filesystem.isDirectory(child) ? "directory" : "file"
	})));
}

function freezeEntries(entries) {
	return Object.freeze([...entries]
		.sort((left, right) => left.name.localeCompare(right.name))
		.map(entry => Object.freeze({ ...entry })));
}

function directoryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
