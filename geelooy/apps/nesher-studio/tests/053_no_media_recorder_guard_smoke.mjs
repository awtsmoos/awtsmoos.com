//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 053_no_media_recorder_guard_smoke.mjs
* @description Recursively scans Studio source-like files for forbidden browser-recorder API usage without naming that token contiguously in the guard itself.
* The Awtsmoos lets a second watcher walk every active file while remaining invisible to the pattern it must expose;
* Awtsmoos.com keeps this independent guard readable and cwd-stable, so one broken watcher cannot make false safety compose.
*/
import assert from 'node:assert/strict';
import {
	readdirSync,
	readFileSync,
	statSync
} from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const recorderName = ['Media', 'Recorder'].join('');
const forbiddenTerms = [
	recorderName,
	`new ${recorderName}`,
	`${recorderName}.isTypeSupported`
];
const ignoredDirectories = new Set([
	'.git',
	'node_modules'
]);
const checkedExtensions = new Set([
	'.js',
	'.mjs',
	'.html',
	'.css',
	'.md'
]);
const hits = [];

walkDirectory(appRoot);
assert.deepEqual(hits, []);
console.log('B"H active no forbidden recorder guard passed');

/** Walks one directory tree and scans only source-like files owned by this Studio. */
function walkDirectory(directory) {
	for (const name of readdirSync(directory)) {
		if (ignoredDirectories.has(name)) {
			continue;
		}
		const path = join(directory, name);
		const stat = statSync(path);
		if (stat.isDirectory()) {
			walkDirectory(path);
			continue;
		}
		if (shouldScan(path)) {
			scanFile(path);
		}
	}
}

/** Returns whether one source-like file belongs in the independent forbidden-token scan. */
function shouldScan(path) {
	return checkedExtensions.has(extname(path))
		&& !path.endsWith('053_no_media_recorder_guard_smoke.mjs');
}

/** Records every forbidden term found in one file without hiding multiple violations. */
function scanFile(path) {
	const text = readFileSync(path, 'utf8');
	for (const term of forbiddenTerms) {
		if (text.includes(term)) {
			hits.push(`${path}: ${term}`);
		}
	}
}
