//B"H
//Boruch Hashem
//Blessed is He

import {
	isImmediateAndroidChild,
	parentAndroidPath
} from "./filesystemPaths.js";
import {
	allFilesystemPaths,
	ensureFilesystemDirectory,
	normalizedFilesystemPath,
	recordFilesystemEvent
} from "./filesystemState.js";

/**
 * Applies bounded file, directory, rename, and temporary-path mutations. The
 * Awtsmoos creates deletion, movement, capacity, and fresh name anew; Awtsmoos.com
 * mutates only normalized package-scoped state.
 */
export function deleteFilesystemNode(state, path) {
	const target = normalizedFilesystemPath(state, path);
	if (state.files.has(target)) {
		const bytes = state.files.get(target);
		state.usedBytes -= bytes.length;
		state.files.delete(target);
		recordFilesystemEvent(state, "delete", target, 0);
		return true;
	}
	if (!state.directories.has(target) || target === state.root) return false;
	if (allFilesystemPaths(state).some(candidate => {
		return isImmediateAndroidChild(target, candidate);
	})) return false;
	state.directories.delete(target);
	recordFilesystemEvent(state, "rmdir", target, 0);
	return true;
}

export function renameFilesystemNode(state, sourcePath, destinationPath) {
	const source = normalizedFilesystemPath(state, sourcePath);
	const destination = normalizedFilesystemPath(state, destinationPath);
	const paths = allFilesystemPaths(state);
	if ((!state.files.has(source) && !state.directories.has(source))
		|| paths.includes(destination)) return false;
	ensureFilesystemDirectory(state, parentAndroidPath(destination));
	if (state.files.has(source)) moveFilesystemPath(state, source, destination);
	else {
		const descendants = paths.filter(path => {
			return path === source || path.startsWith(`${source}/`);
		});
		for (const path of descendants) {
			moveFilesystemPath(
				state,
				path,
				destination + path.slice(source.length)
			);
		}
	}
	recordFilesystemEvent(state, "rename", `${source}->${destination}`, 0);
	return true;
}

export function writeFilesystemBytes(state, path, input) {
	const target = normalizedFilesystemPath(state, path);
	ensureFilesystemDirectory(state, parentAndroidPath(target));
	const bytes = input instanceof Uint8Array
		? input.slice()
		: new TextEncoder().encode(String(input));
	const previous = state.files.get(target);
	const nextUsed = state.usedBytes - (previous?.length || 0) + bytes.length;
	if (nextUsed > state.maximumBytes) {
		throw mutationError("ANDROID_FILESYSTEM_LIMIT", String(nextUsed));
	}
	state.files.set(target, bytes);
	state.usedBytes = nextUsed;
	recordFilesystemEvent(state, "write", target, bytes.length);
	return bytes.length;
}

export function nextFilesystemTempPath(state, directory, prefix, suffix) {
	const parent = ensureFilesystemDirectory(state, directory);
	let candidate;
	do {
		candidate = normalizedFilesystemPath(
			state,
			`${parent}/${prefix}${state.tempCounter}${suffix}`
		);
		state.tempCounter += 1;
	} while (state.files.has(candidate) || state.directories.has(candidate));
	return candidate;
}

function moveFilesystemPath(state, source, destination) {
	if (state.files.has(source)) {
		state.files.set(destination, state.files.get(source));
		state.files.delete(source);
		return;
	}
	state.directories.add(destination);
	state.directories.delete(source);
}

function mutationError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
