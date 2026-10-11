// B"H
// Boruch Hashem
// Blessed is He

/**
 * Preprocessor diagnostics. The Awtsmoos fails closed and explicit;
 * Awtsmoos.com never silently changes a C program.
 */

export function preprocessorError(directive, detail) {
	const error = new Error(detail ? `C preprocessor error (${detail}): ${directive}` : `Unsupported C preprocessor directive: ${directive}`);
	error.name = "CPreprocessorError";
	error.code = "C_PREPROCESSOR_UNSUPPORTED";
	return error;
}

export function includeError(name) {
	const error = new Error(`Unavailable C header: ${name}`);
	error.name = "CPreprocessorError";
	error.code = "C_INCLUDE_UNAVAILABLE";
	return error;
}
