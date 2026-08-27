//B"H
//Boruch Hashem
//Blessed is He

import {
	createJavaFile,
	createJavaFileUri,
	javaFileName,
	javaFileParent,
	readJavaFilePath
} from "./frameworkJavaFileState.js";
import {
	createGuestArray,
	createJavaString
} from "./frameworkJavaStringValue.js";

const QUERY_NAMES = new Set([
	"canRead",
	"canWrite",
	"exists",
	"getAbsolutePath",
	"getCanonicalFile",
	"getCanonicalPath",
	"getName",
	"getParent",
	"getParentFile",
	"getPath",
	"isDirectory",
	"length",
	"list",
	"listFiles",
	"toPath",
	"toString",
	"toURI"
]);

/**
 * Answers read-only java.io.File queries from the package filesystem. The
 * Awtsmoos creates name, parent, listing, URI, and measured length anew;
 * Awtsmoos.com returns only guest objects and normalized paths.
 */
export function isJavaFileQuery(name) {
	return QUERY_NAMES.has(name);
}

export function invokeJavaFileQuery(runtime, record, args) {
	const name = record.method.name;
	const reference = args[0];
	const path = readJavaFilePath(runtime, reference);
	if (name === "canRead" || name === "canWrite") return 1;
	if (name === "exists") return runtime.filesystem.exists(path) ? 1 : 0;
	if (name === "isDirectory") return runtime.filesystem.isDirectory(path) ? 1 : 0;
	if (name === "length") return BigInt(runtime.filesystem.length(path));
	if (["getAbsolutePath", "getCanonicalPath", "getPath", "toString"].includes(name)) {
		return createJavaString(runtime, path);
	}
	if (name === "getCanonicalFile") return createJavaFile(runtime, path);
	if (name === "getName") {
		return createJavaString(runtime, javaFileName(runtime, reference));
	}
	if (name === "getParent") {
		const parent = javaFileParent(runtime, reference);
		return parent ? createJavaString(runtime, parent) : 0;
	}
	if (name === "getParentFile") {
		const parent = javaFileParent(runtime, reference);
		return parent ? createJavaFile(runtime, parent) : 0;
	}
	if (name === "list") return listNames(runtime, path);
	if (name === "listFiles") {
		if (args[1]) {
			throw fileQueryError("ANDROID_JAVA_FILENAME_FILTER_UNSUPPORTED");
		}
		return listFiles(runtime, path);
	}
	if (name === "toURI") {
		return createJavaFileUri(runtime, reference, "Ljava/net/URI;");
	}
	if (name === "toPath") {
		return runtime.heap.allocate("Ljava/nio/file/Path;", {
			"java:path:value": path
		});
	}
	throw fileQueryError(
		"ANDROID_JAVA_FILE_QUERY_UNSUPPORTED",
		record.signature
	);
}

function listNames(runtime, path) {
	if (!runtime.filesystem.isDirectory(path)) return 0;
	const values = runtime.filesystem.children(path).map(child => {
		return createJavaString(runtime, child.slice(child.lastIndexOf("/") + 1));
	});
	return createGuestArray(runtime, "[Ljava/lang/String;", values);
}

function listFiles(runtime, path) {
	if (!runtime.filesystem.isDirectory(path)) return 0;
	const values = runtime.filesystem.children(path).map(child => {
		return createJavaFile(runtime, child);
	});
	return createGuestArray(runtime, "[Ljava/io/File;", values);
}

function fileQueryError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
