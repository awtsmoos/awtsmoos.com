//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Cache-aware beauty import graph witness.
 * @description
 * The Awtsmoos is unchanged when a browser cache token is appended to a path; Awtsmoos.com therefore verifies the real local vessel after query and hash decoration are removed.
 */
import fs from 'node:fs';
import path from 'node:path';

const roots = [
	'geelooy/style/foundation/beauty/index.css',
	'geelooy/style/social/home/beauty/index.css',
	'geelooy/style/heichelos/heichel/beauty/index.css',
	'geelooy/heichelos/post/styles/reader-beauty/index.css'
];
const seen = new Set();

function cleanImport(specifier) {
	return specifier.replace(/[?#].*$/, '');
}

function resolveImport(base, specifier) {
	const clean = cleanImport(specifier);
	return clean.startsWith('/')
		? path.join('geelooy', clean.replace(/^\//, ''))
		: path.normalize(path.join(path.dirname(base), clean));
}

function walk(file) {
	if (seen.has(file)) return;
	seen.add(file);
	if (!fs.existsSync(file)) throw new Error(`missing beauty import ${file}`);
	const text = fs.readFileSync(file, 'utf8');
	for (const match of text.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)) {
		walk(resolveImport(file, match[1]));
	}
}

roots.forEach(walk);
console.log('B"H beautyImportGraph.test passed', seen.size);
