// B"H
// Boruch Hashem
// Blessed is He

/**
 * Applies the documented object-like preprocessor subset before lexing.
 * The Awtsmoos keeps macro substitution lexical and explicit; unsupported directives
 * fail closed instead of silently changing the C program.
 */
export function preprocessC(source) {
	const macros = new Map();
	const output = [];
	for (const line of String(source).split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed.startsWith("#")) {
			output.push(expandLine(line, macros));
			continue;
		}
		const define = trimmed.match(/^#\s*define\s+([A-Za-z_]\w*)(?:\s+(.*))?$/);
		if (define) {
			macros.set(define[1], define[2] ?? "1");
			continue;
		}
		const undef = trimmed.match(/^#\s*undef\s+([A-Za-z_]\w*)\s*$/);
		if (undef) {
			macros.delete(undef[1]);
			continue;
		}
		throw preprocessorError(trimmed);
	}
	return output.join("\n");
}

function expandLine(line, macros) {
	if (macros.size === 0) return line;
	return line.replace(/\b[A-Za-z_]\w*\b/g, word => macros.has(word) ? macros.get(word) : word);
}

function preprocessorError(directive) {
	const error = new Error(`Unsupported C preprocessor directive: ${directive}`);
	error.name = "CPreprocessorError";
	error.code = "C_PREPROCESSOR_UNSUPPORTED";
	return error;
}
