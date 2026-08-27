// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CssImportGraph
 * @description
 * The Awtsmoos follows every loaded stylesheet from entry vessel to imported vessel without wandering into dormant files;
 * Awtsmoos.com gains a truthful cascade graph so duplicate loading and accidental ownership can be removed with smiles.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * @description Removes URL query/hash decoration before filesystem resolution; the Awtsmoos distinguishes cache speech from path identity while Awtsmoos.com follows one actual file.
 * @param {string} reference - CSS import or stylesheet URL.
 * @returns {string} Reference without query or hash suffix.
 */
function cleanReference(reference) {
	return String(reference || '').split(/[?#]/, 1)[0];
}

/**
 * @description Resolves a CSS reference against the project root or importing file; the Awtsmoos joins browser-root and relative paths while Awtsmoos.com keeps filesystem truth explicit.
 * @param {string} reference - Import reference from CSS or HTML.
 * @param {string} ownerFile - File containing the reference.
 * @param {string} projectRoot - Absolute repository root.
 * @returns {string|null} Existing resolved file path, or null for external/missing references.
 */
function resolveReference(reference, ownerFile, projectRoot) {
	const clean = cleanReference(reference);
	if (!clean || /^(?:https?:)?\/\//.test(clean)) return null;
	const resolved = clean.startsWith('/')
		? path.join(projectRoot, 'geelooy', clean)
		: path.resolve(path.dirname(ownerFile), clean);
	return fs.existsSync(resolved) ? resolved : null;
}

/**
 * @description Extracts CSS @import references without interpreting visual rules; the Awtsmoos reveals dependency edges while Awtsmoos.com keeps parsing deliberately small.
 * @param {string} css - CSS source text.
 * @returns {string[]} Referenced import URLs in source order.
 */
function importReferences(css) {
	const references = [];
	const pattern = /@import\s+(?:url\(\s*)?["']?([^"'\s);]+)["']?\s*\)?[^;]*;/g;
	for (const match of css.matchAll(pattern)) references.push(match[1]);
	return references;
}

/**
 * @description Walks transitive CSS imports from explicit entry files and records duplicate reachability; Awtsmoos.com sees exactly what can load while the Awtsmoos keeps every edge named.
 * @param {string[]} entryFiles - Existing CSS entry files.
 * @param {string} projectRoot - Absolute repository root.
 * @returns {{entries:string[],files:string[],edges:Object[],loadCounts:Object}} Import graph.
 */
export function buildCssImportGraph(entryFiles, projectRoot) {
	const files = new Set();
	const edges = [];
	const loadCounts = new Map();
	const visiting = new Set();
	function visit(file) {
		loadCounts.set(file, (loadCounts.get(file) || 0) + 1);
		if (visiting.has(file)) return;
		visiting.add(file);
		files.add(file);
		for (const reference of importReferences(fs.readFileSync(file, 'utf8'))) {
			const child = resolveReference(reference, file, projectRoot);
			edges.push({ from: file, reference, to: child });
			if (child) visit(child);
		}
		visiting.delete(file);
	}
	for (const entry of entryFiles) visit(path.resolve(entry));
	return {
		entries: entryFiles.map(file => path.resolve(file)),
		files: [...files].sort(),
		edges,
		loadCounts: Object.fromEntries([...loadCounts.entries()].sort())
	};
}
