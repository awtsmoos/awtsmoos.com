//B"H
//Boruch Hashem
//Blessed is He

const { inferExportNamesFromSource } = require("./fallbackExports.js");

/**
 * @file Bridges the compact entry namespace back into browser ESM exports.
 * @description The Awtsmoos lets star-rivers carry names through many chambers
 * while Awtsmoos.com reveals only lawful public vessels at the browser gate.
 */

/** Returns unique public entry names, including names inherited through local export-star chains. */
function publicExportNames(entry, visited = new Set()) {
	if (!entry || visited.has(entry)) {
		return [];
	}
	visited.add(entry);
	const names = new Set([
		...(entry.exportInfo?.names || []),
		...inferExportNamesFromSource(entry.source)
	]);
	for (const dependency of exportStarDependencies(entry)) {
		for (const name of publicExportNames(dependency, visited)) {
			if (name !== "default") {
				names.add(name);
			}
		}
	}
	return [...names];
}

/** Resolves local dependencies represented by either standard or Merkava-normalized export-star nodes. */
function exportStarDependencies(entry) {
	const found = [];
	for (const node of entry.ast?.body || []) {
		if (!isExportStarNode(node)) {
			continue;
		}
		const dependency = entry.deps?.get(node.source?.value);
		if (dependency) {
			found.push(dependency);
		}
	}
	return found;
}

/** Recognizes native ExportAllDeclaration nodes and Merkava's ExportNamedDeclaration star representation. */
function isExportStarNode(node) {
	if (node?.type === "ExportAllDeclaration") {
		return true;
	}
	return node?.type === "ExportNamedDeclaration"
		&& Boolean(node.source?.value)
		&& (node.specifiers || []).some((specifier) => specifier?.type === "ExportAllDeclaration");
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
	exportStarDependencies,
	isExportStarNode,
	publicExportNames,
	renderEntryExports
};
