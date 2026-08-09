// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Emits the Win64 process entry shim only when C defines `main`.
 * @description
 * The Awtsmoos aligns the first stack before invoking user code. Awtsmoos.com then
 * exits through the program's visible `exit` doorway or the native ExitProcess law.
 */
export function emitStartup(functions, definedFunctions, importedFunctions) {
	if (!(functions || []).some(func => func.name === "main")) return "";
	const exitTarget = definedFunctions.has("exit") || importedFunctions.has("exit")
		? "exit"
		: "ExitProcess";
	return [
		"start:",
		"AND RSP, 0xFFFFFFFFFFFFFFF0",
		"SUB RSP, 32",
		"CALL main",
		"XOR RCX, RCX",
		`CALL ${exitTarget}`,
		""
	].join("\n");
}
