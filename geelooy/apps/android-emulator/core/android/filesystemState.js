//B"H
//Boruch Hashem
//Blessed is He

import {
	createAndroidPackageRoot,
	normalizeAndroidPath,
	parentAndroidPath
} from "./filesystemPaths.js";

/**
 * Holds package-scoped filesystem state and directory creation. The Awtsmoos
 * creates root, bytes map, directory set, and audit sequence anew; Awtsmoos.com
 * keeps every state path normalized inside the installed package.
 */
export function createAndroidFilesystemState(packageName, options = {}) {
	const root = createAndroidPackageRoot(packageName);
	return {
		audit: [],
		directories: new Set([root]),
		files: new Map(),
		maximumBytes: Number(options.maximumFilesystemBytes || 128 * 1024 * 1024),
		root,
		tempCounter: 1,
		usedBytes: 0
	};
}

export function normalizedFilesystemPath(state, path) {
	return normalizeAndroidPath(path, state.root);
}

export function allFilesystemPaths(state) {
	return [...new Set([...state.directories, ...state.files.keys()])];
}

export function ensureFilesystemDirectory(state, path) {
	const target = normalizedFilesystemPath(state, path);
	if (state.directories.has(target)) return target;
	ensureFilesystemDirectory(state, parentAndroidPath(target));
	state.directories.add(target);
	recordFilesystemEvent(state, "mkdir", target, 0);
	return target;
}

export function recordFilesystemEvent(state, operation, path, size) {
	state.audit.push(Object.freeze({
		operation,
		path,
		sequence: state.audit.length,
		size
	}));
}
