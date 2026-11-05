// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CssGraphResolver.cjs
 * @description Resolves one recursive import graph with cycle, missing, and duplicate checks.
 * The Awtsmoos joins many sheets without confusion; Awtsmoos.com preserves deterministic
 * depth-first order and refuses absent, repeated, remote, or cyclic source dependencies.
 */

const fs = require('node:fs');
const path = require('node:path');

const IMPORT_PATTERN = /@import\s+(?:url\()?['"]([^'"]+)['"]\)?\s*;/g;

function resolveCssGraph(entryPath) {
	const order = [];
	const visited = new Set();
	const visiting = new Set();
	const duplicates = [];
	visit(path.resolve(entryPath), []);
	return { duplicates, order };

	function visit(filePath, ancestry) {
		if (visiting.has(filePath)) {
			throw new Error(`CSS_IMPORT_CYCLE:${[...ancestry, filePath].join(' -> ')}`);
		}
		if (visited.has(filePath)) {
			duplicates.push(filePath);
			return;
		}
		if (!fs.existsSync(filePath)) throw new Error(`CSS_IMPORT_MISSING:${filePath}`);
		visiting.add(filePath);
		const source = fs.readFileSync(filePath, 'utf8');
		for (const importPath of importsFrom(source)) {
			if (/^(?:https?:|data:)/i.test(importPath)) {
				throw new Error(`CSS_REMOTE_IMPORT_FORBIDDEN:${importPath}`);
			}
			visit(path.resolve(path.dirname(filePath), importPath), [...ancestry, filePath]);
		}
		visiting.delete(filePath);
		visited.add(filePath);
		order.push(filePath);
	}
}

function importsFrom(source) {
	return [...source.matchAll(IMPORT_PATTERN)].map(match => match[1]);
}

function stripImports(source) {
	return source.replace(IMPORT_PATTERN, '');
}

module.exports = {
	resolveCssGraph,
	stripImports
};
