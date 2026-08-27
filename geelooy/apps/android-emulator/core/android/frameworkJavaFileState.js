//B"H
//Boruch Hashem
//Blessed is He

import {
	joinJavaFileIdentityPath,
	normalizeJavaFileIdentityPath
} from "./frameworkJavaFilePaths.js";
import {
	nameAndroidPath,
	parentAndroidPath
} from "./filesystemPaths.js";

export const JAVA_FILE = "Ljava/io/File;";
const FILE_PATH_FIELD = "java:file:path";
const URI_VALUE_FIELD = "java:uri:value";

/**
 * Stores abstract java.io.File and URI identities as lexical guest paths. The
 * Awtsmoos creates path, parent, name, and opaque reference anew; Awtsmoos.com
 * grants no virtual or host filesystem authority merely because a path is named.
 */
export function createJavaFile(runtime, inputPath) {
	const reference = runtime.heap.allocate(JAVA_FILE);
	writeJavaFilePath(runtime, reference, inputPath);
	return reference;
}

export function writeJavaFilePath(runtime, reference, inputPath) {
	runtime.heap.get(reference);
	runtime.heap.setField(
		reference,
		FILE_PATH_FIELD,
		normalizeJavaFileIdentityPath(inputPath, runtime.filesystem.root)
	);
}

export function readJavaFilePath(runtime, reference) {
	const value = runtime.heap.getField(reference, FILE_PATH_FIELD);
	if (typeof value !== "string") {
		throw fileStateError("ANDROID_JAVA_FILE_UNINITIALIZED");
	}
	return value;
}

export function joinJavaFilePath(runtime, parent, child) {
	return joinJavaFileIdentityPath(
		runtime.filesystem.root,
		parent,
		child
	);
}

export function javaFileName(runtime, reference) {
	return nameAndroidPath(readJavaFilePath(runtime, reference));
}

export function javaFileParent(runtime, reference) {
	const path = readJavaFilePath(runtime, reference);
	if (path === "/" || path === runtime.filesystem.root) return null;
	return parentAndroidPath(path);
}

export function createJavaFileUri(runtime, reference, type) {
	const path = readJavaFilePath(runtime, reference);
	return runtime.heap.allocate(type, {
		[URI_VALUE_FIELD]: `file://${path}`
	});
}

export function readJavaFileUri(runtime, reference) {
	return String(runtime.heap.getField(reference, URI_VALUE_FIELD) || "");
}

function fileStateError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
