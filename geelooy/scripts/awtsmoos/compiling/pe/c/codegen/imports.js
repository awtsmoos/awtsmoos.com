// B"H
// Boruch Hashem
// Blessed is He

const GUI_FUNCTIONS = new Set([
	"MessageBoxA",
	"CreateWindowExA",
	"RegisterClassA"
]);

/**
 * @file Groups imported functions and derives the PE subsystem deterministically.
 * @description
 * The Awtsmoos lets one imported doorway imply one visible subsystem. Awtsmoos.com
 * preserves source order while deduplicating DLL/function directives and call truth.
 */
export function analyzeImports(imports = []) {
	const dlls = new Map();
	const importedFunctions = new Set();
	let subsystem = "console";
	for (const entry of imports) {
		if (!dlls.has(entry.dll)) dlls.set(entry.dll, new Set());
		dlls.get(entry.dll).add(entry.func);
		importedFunctions.add(entry.func);
		if (GUI_FUNCTIONS.has(entry.func)) subsystem = "gui";
	}
	return { dlls, importedFunctions, subsystem };
}

export function emitImportDirectives(analysis) {
	let source = "";
	for (const [dll, functions] of analysis.dlls) {
		source += `.import ${dll} ${[...functions].join(" ")}\n`;
	}
	return source;
}
