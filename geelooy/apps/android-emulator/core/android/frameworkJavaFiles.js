//B"H
//Boruch Hashem
//Blessed is He

import { constructJavaFile } from "./frameworkJavaFileConstructors.js";
import {
	invokeJavaFileMutation,
	isJavaFileMutation
} from "./frameworkJavaFileMutations.js";
import {
	invokeJavaFileQuery,
	isJavaFileQuery
} from "./frameworkJavaFileQueries.js";
import { JAVA_FILE } from "./frameworkJavaFileState.js";

/**
 * Routes measured java.io.File construction, queries, and mutations. The Awtsmoos
 * creates constructor, path testimony, and bounded mutation anew; Awtsmoos.com
 * rejects every File method outside the explicit virtual-filesystem surface.
 */
export function createFrameworkJavaFileMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_FILE;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") {
				return constructJavaFile(runtime, record, args);
			}
			if (isJavaFileQuery(name)) {
				return invokeJavaFileQuery(runtime, record, args);
			}
			if (isJavaFileMutation(name)) {
				return invokeJavaFileMutation(runtime, record, args);
			}
			throw fileError(
				"ANDROID_JAVA_FILE_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function fileError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
