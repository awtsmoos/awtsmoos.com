//B"H
//Boruch Hashem
//Blessed is He

import {
	joinJavaFilePath,
	readJavaFilePath,
	writeJavaFilePath
} from "./frameworkJavaFileState.js";
import { readJavaText } from "./frameworkJavaStringValue.js";

/**
 * Constructs java.io.File references from measured string and parent forms. The
 * Awtsmoos creates parent, child, normalization, and opaque File garment anew;
 * Awtsmoos.com resolves every constructor inside the package filesystem root.
 */
export function constructJavaFile(runtime, record, args) {
	const descriptor = record.method.descriptor;
	let path;
	if (descriptor === "(Ljava/lang/String;)V") {
		path = readJavaText(runtime, args[1]);
	} else if (descriptor === "(Ljava/io/File;Ljava/lang/String;)V") {
		const parent = args[1]
			? readJavaFilePath(runtime, args[1])
			: runtime.filesystem.root;
		path = joinJavaFilePath(
			runtime,
			parent,
			readJavaText(runtime, args[2])
		);
	} else if (descriptor === "(Ljava/lang/String;Ljava/lang/String;)V") {
		const parent = args[1]
			? readJavaText(runtime, args[1])
			: runtime.filesystem.root;
		path = joinJavaFilePath(
			runtime,
			parent,
			readJavaText(runtime, args[2])
		);
	} else {
		throw fileConstructorError(
			"ANDROID_JAVA_FILE_CONSTRUCTOR_UNSUPPORTED",
			descriptor
		);
	}
	writeJavaFilePath(runtime, args[0], path);
}

function fileConstructorError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
