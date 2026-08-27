//B"H
//Boruch Hashem
//Blessed is He

import { createJavaFile } from "./frameworkJavaFileState.js";
import {
	createGuestArray,
	readJavaText
} from "./frameworkJavaStringValue.js";

const CONTEXT = "Landroid/content/Context;";
const FILE_ARRAY = "[Ljava/io/File;";
const DIRECTORY_METHODS = new Set([
	"getCacheDir",
	"getCodeCacheDir",
	"getDataDir",
	"getDatabasePath",
	"getDir",
	"getExternalCacheDirs",
	"getExternalFilesDir",
	"getExternalFilesDirs",
	"getExternalMediaDirs",
	"getFilesDir",
	"getNoBackupFilesDir"
]);

/**
 * Resolves Android application directories inside the package filesystem. The
 * Awtsmoos creates files, cache, database, private, and external vessels anew;
 * Awtsmoos.com returns guest File references and never a host path.
 */
export function createFrameworkAndroidDirectoryMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === CONTEXT
				&& DIRECTORY_METHODS.has(record.method.name);
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "getDataDir") return directory(runtime, "");
			if (name === "getFilesDir") return directory(runtime, "files");
			if (name === "getCacheDir") return directory(runtime, "cache");
			if (name === "getCodeCacheDir") return directory(runtime, "code_cache");
			if (name === "getNoBackupFilesDir") return directory(runtime, "no_backup");
			if (name === "getDatabasePath") {
				return file(runtime, `databases/${safeName(runtime, args[1])}`);
			}
			if (name === "getDir") {
				return directory(runtime, `app_${safeName(runtime, args[1])}`);
			}
			if (name === "getExternalFilesDir") {
				return externalFiles(runtime, args[1]);
			}
			if (name === "getExternalCacheDirs") {
				return fileArray(runtime, [directory(runtime, "external/cache")]);
			}
			if (name === "getExternalFilesDirs") {
				return fileArray(runtime, [externalFiles(runtime, args[1])]);
			}
			if (name === "getExternalMediaDirs") {
				return fileArray(runtime, [directory(runtime, "external/media")]);
			}
			throw directoryError(
				"ANDROID_DIRECTORY_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function directory(runtime, relativePath) {
	const path = relativePath
		? `${runtime.filesystem.root}/${relativePath}`
		: runtime.filesystem.root;
	runtime.filesystem.mkdir(path, true);
	return createJavaFile(runtime, path);
}

function file(runtime, relativePath) {
	return createJavaFile(
		runtime,
		`${runtime.filesystem.root}/${relativePath}`
	);
}

function externalFiles(runtime, typeValue) {
	const type = typeValue ? safeName(runtime, typeValue) : "";
	return directory(runtime, `external/files${type ? `/${type}` : ""}`);
}

function fileArray(runtime, values) {
	return createGuestArray(runtime, FILE_ARRAY, values);
}

function safeName(runtime, value) {
	const name = readJavaText(runtime, value);
	if (!name || name.includes("/") || name.includes("\\") || name.includes("\0")) {
		throw directoryError("ANDROID_DIRECTORY_NAME_INVALID", name);
	}
	return name;
}

function directoryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
