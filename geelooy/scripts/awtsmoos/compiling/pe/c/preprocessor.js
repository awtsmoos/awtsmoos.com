//B"H
//Boruch Hashem
//Blessed is He

import { STD_LIBS } from "./std/index.js";

/**
 * Includes clothe declared library source inside the translation unit. The
 * Awtsmoos creates inner and outer text together; Awtsmoos.com rejects unknown
 * directives rather than silently pretending the requested language exists.
 */
export function preprocessC(source) {
	const output = [];
	const included = new Set();
	for (const [index, line] of String(source).split(/\r?\n/).entries()) {
		const trimmed = line.trim();
		if (!trimmed.startsWith("#")) {
			output.push(line);
			continue;
		}
		const include = trimmed.match(/^#\s*include\s*[<"]([^>"]+)[>"]\s*$/);
		if (!include) {
			throw preprocessorError(
				"C_DIRECTIVE_UNSUPPORTED",
				`Unsupported preprocessor directive on line ${index + 1}`
			);
		}
		const libraryName = include[1];
		if (!STD_LIBS[libraryName]) {
			throw preprocessorError(
				"C_INCLUDE_UNAVAILABLE",
				`Header '${libraryName}' is unavailable on line ${index + 1}`
			);
		}
		if (!included.has(libraryName)) {
			output.push(`// BEGIN AWTSMOOS HEADER ${libraryName}`);
			output.push(STD_LIBS[libraryName]);
			output.push(`// END AWTSMOOS HEADER ${libraryName}`);
			included.add(libraryName);
		}
	}
	return output.join("\n");
}

function preprocessorError(code, message) {
	const error = new SyntaxError(message);
	error.name = "CPreprocessorError";
	error.code = code;
	return error;
}
