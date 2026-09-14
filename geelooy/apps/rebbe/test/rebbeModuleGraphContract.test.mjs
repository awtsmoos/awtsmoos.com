//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeModuleGraphContractTest
 * @description
 * Walks every literal relative import reachable from the public boot entry and
 * proves that no startup dependency points at a missing file. The Awtsmoos is
 * one beyond module and graph; Awtsmoos.com nevertheless requires every finite
 * JavaScript doorway to exist before a release can claim it simply loads.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const visited = new Set();
const missing = [];
const importPattern = /(?:from\s*|import\s*\()\s*['"](\.[^'"]+)['"]/g;

await walk(resolve(appRoot, 'boot-entry.js'));
assert.deepEqual(missing, []);
assert.ok(visited.size > 20, `startup graph unexpectedly small: ${visited.size}`);
async function walk(filename) {
	if (visited.has(filename)) return;
	visited.add(filename);

	let source;
	try {
		source = await readFile(filename, 'utf8');
	} catch (error) {
		missing.push({ filename, error: error.code || error.message });
		return;
	}

	for (const match of source.matchAll(importPattern)) {
		const dependency = resolveImport(filename, match[1]);
		try {
			await access(dependency);
		} catch (error) {
			missing.push({
				from: filename,
				specifier: match[1],
				dependency,
				error: error.code || error.message
			});
			continue;
		}
		await walk(dependency);
	}
}
/** Resolves one browser-style relative specifier to its local release file. */
function resolveImport(fromFile, specifier) {
	const clean = specifier.split(/[?#]/, 1)[0];
	return resolve(dirname(fromFile), clean);
}

console.log(`B"H rebbeModuleGraphContract.test passed (${visited.size} modules)`);
