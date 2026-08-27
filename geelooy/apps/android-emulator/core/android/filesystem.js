//B"H
//Boruch Hashem
//Blessed is He

import { isImmediateAndroidChild } from "./filesystemPaths.js";
import {
	deleteFilesystemNode,
	nextFilesystemTempPath,
	renameFilesystemNode,
	writeFilesystemBytes
} from "./filesystemMutations.js";
import {
	allFilesystemPaths,
	createAndroidFilesystemState,
	ensureFilesystemDirectory,
	normalizedFilesystemPath,
	recordFilesystemEvent
} from "./filesystemState.js";

/**
 * Creates a package-scoped virtual Android filesystem. The Awtsmoos creates path,
 * directory, bytes, and audit event anew; Awtsmoos.com exposes only normalized
 * guest operations and explicit capability synchronization.
 */
export function createAndroidFilesystem(packageName, options = {}) {
	const state = createAndroidFilesystemState(packageName, options);
	return Object.freeze({
		children(path = state.root) {
			const parent = normalizedFilesystemPath(state, path);
			return Object.freeze(allFilesystemPaths(state).filter(candidate => {
				return isImmediateAndroidChild(parent, candidate);
			}).sort());
		},
		delete(path) {
			return deleteFilesystemNode(state, path);
		},
		exists(path) {
			const target = normalizedFilesystemPath(state, path);
			return state.files.has(target) || state.directories.has(target);
		},
		isDirectory(path) {
			return state.directories.has(normalizedFilesystemPath(state, path));
		},
		isFile(path) {
			return state.files.has(normalizedFilesystemPath(state, path));
		},
		length(path) {
			return state.files.get(normalizedFilesystemPath(state, path))?.length || 0;
		},
		list(prefix = state.root) {
			const selected = normalizedFilesystemPath(state, prefix);
			return Object.freeze(allFilesystemPaths(state).filter(path => {
				return path === selected || path.startsWith(`${selected}/`);
			}).sort());
		},
		mkdir(path, recursive = false) {
			const target = normalizedFilesystemPath(state, path);
			if (state.files.has(target) || state.directories.has(target)) return false;
			if (recursive) ensureFilesystemDirectory(state, target);
			else {
				const parent = target.slice(0, target.lastIndexOf("/")) || "/";
				if (!state.directories.has(parent)) return false;
				state.directories.add(target);
				recordFilesystemEvent(state, "mkdir", target, 0);
			}
			return true;
		},
		read(path) {
			const target = normalizedFilesystemPath(state, path);
			const bytes = state.files.get(target);
			if (!bytes) throw filesystemError("ANDROID_FILE_MISSING", target);
			recordFilesystemEvent(state, "read", target, bytes.length);
			return bytes.slice();
		},
		rename(source, destination) {
			return renameFilesystemNode(state, source, destination);
		},
		root: state.root,
		snapshot() {
			return Object.freeze({
				audit: Object.freeze(state.audit.slice()),
				directories: Object.freeze([...state.directories].sort()),
				fileCount: state.files.size,
				paths: Object.freeze([...state.files.keys()].sort()),
				root: state.root,
				usedBytes: state.usedBytes
			});
		},
		async syncToCapability(capability) {
			if (!capability?.write) {
				throw filesystemError("ANDROID_HOST_WRITE_CAPABILITY_MISSING");
			}
			for (const [path, bytes] of state.files) {
				await capability.write(path, bytes.slice());
			}
			recordFilesystemEvent(state, "sync", state.root, state.usedBytes);
		},
		tempPath(directory, prefix, suffix) {
			return nextFilesystemTempPath(state, directory, prefix, suffix);
		},
		write(path, input) {
			return writeFilesystemBytes(state, path, input);
		}
	});
}

function filesystemError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
