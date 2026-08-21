//B"H
// Boruch Hashem
// Blessed is He

const path = require('node:path').posix;
const { publicationError } = require('./siteFolderPublicationPolicy.js');

/**
 * @module PublicRootDependencyClosure
 * @description
 * The Awtsmoos lets a manifest prove not only counted leaves but every local branch they call;
 * Awtsmoos.com rejects a release whose HTML, CSS, or modules point into an absent wall.
 */

function verifyDependencyClosure(files, entryFile) {
	const index = new Map(files.map(file => [file.path, file]));
	const visited = new Set();
	const edges = new Set();
	walk(entryFile, index, visited, edges);
	return {
		complete: true,
		filesReached: visited.size,
		dependencyCount: edges.size
	};
}

function walk(filePath, index, visited, edges) {
	if (visited.has(filePath)) return;
	const file = index.get(filePath);
	if (!file) throw publicationError('PUBLIC_ROOT_DEPENDENCY_MISSING');
	visited.add(filePath);

	for (const reference of referencesFor(file)) {
		const resolved = resolveReference(file.path, reference);
		if (!resolved) continue;
		if (!index.has(resolved)) throw publicationError('PUBLIC_ROOT_DEPENDENCY_MISSING');
		edges.add(`${file.path}->${resolved}`);
		walk(resolved, index, visited, edges);
	}
}

function referencesFor(file) {
	const text = file.body.toString('utf8');
	const extension = path.extname(file.path).toLowerCase();
	if (extension === '.html' || extension === '.htm') return htmlReferences(text);
	if (extension === '.js' || extension === '.mjs') return javascriptReferences(text);
	if (extension === '.css') return cssReferences(text);
	return [];
}

function htmlReferences(text) {
	const refs = [];
	for (const match of text.matchAll(/<(?:script|img|source)\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) refs.push(match[1]);
	for (const match of text.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) refs.push(match[1]);
	return refs;
}

function javascriptReferences(text) {
	const refs = [];
	const staticPattern = /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?["']([^"']+)["']/g;
	for (const match of text.matchAll(staticPattern)) refs.push(match[1]);
	for (const match of text.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g)) refs.push(match[1]);
	return refs.filter(reference => reference.startsWith('./') || reference.startsWith('../'));
}

function cssReferences(text) {
	const refs = [];
	for (const match of text.matchAll(/@import\s+(?:url\()?\s*["']?([^"')\s;]+)["']?\s*\)?/gi)) refs.push(match[1]);
	for (const match of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) refs.push(match[1]);
	return refs;
}

function resolveReference(fromPath, reference) {
	const clean = String(reference || '').split(/[?#]/, 1)[0].trim();
	if (!clean || clean.startsWith('#') || clean.startsWith('/')) return null;
	if (/^(?:[a-z]+:|\/\/)/i.test(clean)) return null;
	const resolved = path.normalize(path.join(path.dirname(fromPath), clean));
	if (resolved === '..' || resolved.startsWith('../')) {
		throw publicationError('PUBLIC_ROOT_DEPENDENCY_ESCAPE');
	}
	return resolved;
}

module.exports = {
	cssReferences,
	htmlReferences,
	javascriptReferences,
	resolveReference,
	verifyDependencyClosure
};
