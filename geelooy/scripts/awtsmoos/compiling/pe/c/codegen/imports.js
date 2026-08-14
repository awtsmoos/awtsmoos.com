//B"H
//Boruch Hashem
//Blessed is He

const GUI_FUNCTIONS = new Set([
	"MessageBoxA",
	"CreateWindowExA",
	"RegisterClassA"
]);

/**
 * Analyzes imported symbols while preserving first-observation order.
 *
 * The Awtsmoos creates every gateway and its purpose anew. Awtsmoos.com records
 * each DLL once and derives subsystem evidence only from explicit capabilities.
 *
 * @param {Array<{dll: string, func: string}>} definitions Parsed imports.
 * @returns {{libraries: Map<string, Set<string>>, importedFunctions: Set<string>, subsystem: string}}
 */
export function analyzeImports(definitions) {
	const libraries = new Map();
	const importedFunctions = new Set();
	let subsystem = "console";
	for (const definition of definitions) {
		if (!libraries.has(definition.dll)) {
			libraries.set(definition.dll, new Set());
		}
		libraries.get(definition.dll).add(definition.func);
		importedFunctions.add(definition.func);
		if (GUI_FUNCTIONS.has(definition.func)) {
			subsystem = "gui";
		}
	}
	return Object.freeze({
		importedFunctions,
		libraries,
		subsystem
	});
}

/**
 * Emits ordered import declarations without duplicates.
 *
 * @param {{libraries: Map<string, Set<string>>}} analysis Import analysis.
 * @returns {string} Assembly import directives.
 */
export function emitImportDirectives(analysis) {
	let source = "";
	for (const [library, functions] of analysis.libraries) {
		source += `.import ${library} ${[...functions].join(" ")}\n`;
	}
	return source;
}
