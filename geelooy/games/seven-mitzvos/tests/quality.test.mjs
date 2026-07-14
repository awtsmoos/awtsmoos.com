//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, resolve } from 'node:path';

/**
 * @module SevenMitzvosQualityTest
 * @description
 * This test protects the small vessels of Awtsmoos.com from hidden sprawl.
 * The Awtsmoos is infinite, but source files serve clarity through measured
 * boundaries, tab indentation, and the absence of forgotten markers.
 */
const testsDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(testsDirectory, '..');
const checkedExtensions = new Set(['.html', '.css', '.js', '.mjs', '.json']);
const unresolvedPattern = new RegExp(['TO' + 'DO', 'FIX' + 'ME'].join('|'));
const files = await collectFiles(projectDirectory);
let largestFile = { path: '', lines: 0 };

for (const path of files) {
	if (!checkedExtensions.has(extname(path))) {
		continue;
	}

	const content = await readFile(path, 'utf8');
	const lines = content.split(/\r?\n/);
	if (lines.length > largestFile.lines) {
		largestFile = { path, lines: lines.length };
	}

	assert.ok(lines.length <= 120, `${path} exceeds 120 lines.`);
	assert.doesNotMatch(content, unresolvedPattern, `${path} contains unresolved work markers.`);

	for (const [index, line] of lines.entries()) {
		const isJSDocBody = /^ \*/.test(line);
		const startsWithSpaces = /^ +/.test(line);
		assert.ok(!startsWithSpaces || isJSDocBody, `${path}:${index + 1} uses space indentation.`);
	}
}

console.log(`B"H · Quality verified. Largest file: ${largestFile.lines} lines.`);

/**
 * Recursively discovers every file below the experience root.
 *
 * @param {string} directory Directory to inspect.
 * @returns {Promise<string[]>} Absolute file paths.
 */
async function collectFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const paths = [];

	for (const entry of entries) {
		const path = resolve(directory, entry.name);
		if (entry.isDirectory()) {
			paths.push(...await collectFiles(path));
			continue;
		}

		paths.push(path);
	}

	return paths;
}
