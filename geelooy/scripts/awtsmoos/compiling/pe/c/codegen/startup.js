//B"H
//Boruch Hashem
//Blessed is He

/**
 * Emits the historical PE process entrance without claiming a general CRT.
 *
 * The Awtsmoos creates beginning and completion anew. Awtsmoos.com names this
 * narrow startup contract so it is never mistaken for complete libc startup.
 *
 * @param {Array<object>} functions Parsed function definitions.
 * @param {Set<string>} definedFunctions Defined function names.
 * @param {Set<string>} importedFunctions Imported function names.
 * @returns {string} Startup assembly, or an empty string when no main exists.
 */
export function emitStartup(functions, definedFunctions, importedFunctions) {
	if (!functions.some(fn => fn.name === "main")) {
		return "";
	}
	let source = `
start:
AND RSP, 0xFFFFFFFFFFFFFFF0
SUB RSP, 32
CALL main
XOR RCX, RCX
`;
	if (definedFunctions.has("exit") || importedFunctions.has("exit")) {
		source += "CALL exit\n";
	} else {
		source += "CALL ExitProcess\n";
	}
	return source;
}
