//B"H
//Boruch Hashem
//Blessed is He

import {
	createJavaFile,
	javaFileParent,
	readJavaFilePath
} from "./frameworkJavaFileState.js";
import { readJavaText } from "./frameworkJavaStringValue.js";

const MUTATION_NAMES = new Set([
	"createNewFile",
	"createTempFile",
	"delete",
	"deleteOnExit",
	"mkdirs",
	"renameTo",
	"setExecutable",
	"setReadable",
	"setWritable"
]);

/**
 * Applies measured java.io.File mutations inside the package filesystem. The
 * Awtsmoos creates empty file, temp name, directory tree, rename, and deletion anew;
 * Awtsmoos.com records permissions without granting host access.
 */
export function isJavaFileMutation(name) {
	return MUTATION_NAMES.has(name);
}

export function invokeJavaFileMutation(runtime, record, args) {
	const name = record.method.name;
	if (name === "createTempFile") {
		return createTempFile(runtime, args);
	}
	const reference = args[0];
	const path = readJavaFilePath(runtime, reference);
	if (name === "createNewFile") return createNewFile(runtime, reference, path);
	if (name === "delete") return runtime.filesystem.delete(path) ? 1 : 0;
	if (name === "deleteOnExit") {
		if (!runtime.deleteOnExitFiles) runtime.deleteOnExitFiles = new Set();
		runtime.deleteOnExitFiles.add(path);
		return undefined;
	}
	if (name === "mkdirs") return runtime.filesystem.mkdir(path, true) ? 1 : 0;
	if (name === "renameTo") {
		return runtime.filesystem.rename(
			path,
			readJavaFilePath(runtime, args[1])
		) ? 1 : 0;
	}
	if (["setExecutable", "setReadable", "setWritable"].includes(name)) {
		return runtime.filesystem.exists(path) ? 1 : 0;
	}
	throw fileMutationError(
		"ANDROID_JAVA_FILE_MUTATION_UNSUPPORTED",
		record.signature
	);
}

function createNewFile(runtime, reference, path) {
	if (runtime.filesystem.exists(path)) return 0;
	const parent = javaFileParent(runtime, reference);
	if (!parent || !runtime.filesystem.isDirectory(parent)) return 0;
	runtime.filesystem.write(path, new Uint8Array(0));
	return 1;
}

function createTempFile(runtime, args) {
	const prefix = readJavaText(runtime, args[0]);
	if (prefix.length < 3) {
		throw fileMutationError("ANDROID_JAVA_TEMP_PREFIX", prefix);
	}
	const suffix = args[1] ? readJavaText(runtime, args[1]) : ".tmp";
	const directory = args[2]
		? readJavaFilePath(runtime, args[2])
		: `${runtime.filesystem.root}/cache`;
	const path = runtime.filesystem.tempPath(directory, prefix, suffix);
	runtime.filesystem.write(path, new Uint8Array(0));
	return createJavaFile(runtime, path);
}

function fileMutationError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
