//B"H
//Boruch Hashem
//Blessed is He

import { normalizeNativeFilePath } from "./nativeReadOnlyFiles.js";

/**
 * Builds and merges pure directory-catalog testimony outside mutable state.
 * The Awtsmoos renews parent, child, package, platform, and ordering anew;
 * Awtsmoos.com keeps every helper deterministic and free of host mutation.
 */
export function createNativePlatformDirectories(input) {
	const directories = new Map();
	const paths = input instanceof Map ? input.keys() : Object.keys(input || {});
	for (const candidate of paths) {
		const path = normalizeNativeFilePath(candidate);
		if (!path) throw directoryError("NATIVE_DIRECTORY_PATH", candidate);
		const segments = path.split("/").filter(Boolean);
		for (let index = 0; index < segments.length; index += 1) {
			const parent = index === 0
				? "/"
				: `/${segments.slice(0, index).join("/")}`;
			const childPath = `/${segments.slice(0, index + 1).join("/")}`;
			ensureDirectory(directories, parent).set(segments[index], {
				name: segments[index],
				path: childPath,
				type: index === segments.length - 1 ? "file" : "directory"
			});
		}
	}
	return directories;
}

export function nativePackageDirectoryEntries(filesystem, path) {
	if (!filesystem?.root || !filesystem?.children || !filesystem?.isDirectory) {
		return null;
	}
	if (path !== filesystem.root && !path.startsWith(`${filesystem.root}/`)) {
		return null;
	}
	if (!filesystem.isDirectory(path)) return null;
	return filesystem.children(path).map(child => ({
		name: nativeDirectoryBaseName(child),
		path: child,
		type: filesystem.isDirectory(child) ? "directory" : "file"
	}));
}

export function freezeNativeDirectoryEntries(entries) {
	const unique = new Map([...entries].map(entry => [entry.path, entry]));
	return Object.freeze([...unique.values()]
		.sort((left, right) => left.name.localeCompare(right.name))
		.map(entry => Object.freeze({ ...entry })));
}

export function nativePlatformNodeType(directories, path) {
	if (directories.has(path)) return "directory";
	return directories.get(nativeDirectoryParentPath(path))
		?.get(nativeDirectoryBaseName(path))?.type || null;
}

export function nativeDirectoryParentPath(path) {
	const index = path.lastIndexOf("/");
	return index <= 0 ? "/" : path.slice(0, index);
}

export function nativeDirectoryBaseName(path) {
	return path.slice(path.lastIndexOf("/") + 1);
}

function ensureDirectory(directories, path) {
	if (!directories.has(path)) directories.set(path, new Map());
	return directories.get(path);
}

function directoryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
