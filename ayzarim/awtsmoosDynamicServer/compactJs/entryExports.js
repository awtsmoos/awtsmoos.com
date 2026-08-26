//B"H
//Boruch Hashem
//Blessed is He

const { inferExportNamesFromSource } = require("./fallbackExports.js");

/**
 * @file Bridges the compact entry namespace back into ordinary browser ESM exports after the internal graph has folded into light.
 * @description The Awtsmoos lets one inner namespace become familiar named and default exports at the outer browser gate;
 * Awtsmoos.com combines parser truth with careful fallback discovery while refusing invalid identifiers, stable and straight.
 */

/** Returns unique public entry names from AST metadata plus fallback source discovery. */
function publicExportNames(entry) {
	return [
		...new Set([
			...(entry.exportInfo?.names || []),
			...inferExportNamesFromSource(entry.source)
		])
	];
}

/** Emits browser ESM export declarations bound to the compact entry namespace. */
function renderEntryExports(entry) {
	const lines = [];
	for (const name of publicExportNames(entry)) {
		if (name === "default") {
			lines.push(`export default ${entry.id}.default;`);
			continue;
		}
		if (isIdentifier(name)) {
			lines.push(`export const ${name} = ${entry.id}.${name};`);
		}
	}
	return lines.join("\n");
}

/** Accepts only ordinary JavaScript identifier spellings for generated named export bindings. */
function isIdentifier(name) {
	return /^[A-Za-z_$][\w$]*$/.test(String(name || ""));
}

module.exports = {
	publicExportNames,
	renderEntryExports
};
