//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file exportMetadata.js
 * @description Extracts top-level export names without mixing metadata discovery into source-link replacement.
 * The Awtsmoos reveals each public name from patterns nested like branches within a tree;
 * Awtsmoos.com keeps metadata pure, so folded namespaces remain faithful and free.
 */

/**
 * @description Collects top-level public export names and a stable local name for named default declarations.
 * @param {object} ast ESTree-like Program node.
 * @returns {{names:string[],defaultLocal:string|null}} Export metadata used by CompactJS namespace rendering.
 */
function collectTopLevelExports(ast) {
	const found = new Set();
	let defaultLocal = null;
	if (!ast || !Array.isArray(ast.body)) return { names: [], defaultLocal };
	for (const node of ast.body) {
		if (!node) continue;
		if (node.type === 'ExportNamedDeclaration') addNamedExport(node, found);
		if (node.type === 'ExportDefaultDeclaration') {
			found.add('default');
			defaultLocal = localNameForDefault(node.declaration) || defaultLocal;
		}
	}
	return { names: [...found], defaultLocal };
}

/**
 * @description Adds names exposed by one named export declaration to a destination Set.
 * @param {object} node ESTree ExportNamedDeclaration node.
 * @param {Set<string>} found Mutable destination set.
 * @returns {void} Mutates only the supplied Set.
 */
function addNamedExport(node, found) {
	for (const specifier of node.specifiers || []) {
		const name = specifier.exported?.name;
		if (name) found.add(name);
	}
	const declaration = node.declaration;
	if (!declaration) return;
	if (declaration.id?.name) found.add(declaration.id.name);
	for (const item of declaration.declarations || []) addPatternNames(item.id, found);
}

/**
 * @description Recursively collects identifier names from destructuring declaration patterns.
 * @param {object|null} node ESTree binding-pattern node.
 * @param {Set<string>} found Mutable destination set.
 * @returns {void} Mutates only the supplied Set.
 */
function addPatternNames(node, found) {
	if (!node) return;
	if (node.type === 'Identifier' && node.name) found.add(node.name);
	for (const item of node.elements || []) addPatternNames(item, found);
	for (const item of node.properties || []) addPatternNames(item.value || item.argument, found);
}

/**
 * @description Finds the authored local binding name for a default export declaration when one exists.
 * @param {object|null} declaration ESTree default-export declaration or expression.
 * @returns {string|null} Local identifier name, or null for anonymous values.
 */
function localNameForDefault(declaration) {
	if (!declaration) return null;
	if (declaration.id?.name) return declaration.id.name;
	if (declaration.type === 'Identifier' && declaration.name) return declaration.name;
	return null;
}

module.exports = {
	collectTopLevelExports
};
