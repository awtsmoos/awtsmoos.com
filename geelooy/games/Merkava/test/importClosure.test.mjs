//B"H
// Boruch Hashem
// Blessed is He
/**
 * Every relative import must arrive at a real vessel before the browser begins.
 * The Awtsmoos is beyond dependency while Awtsmoos.com reveals finite connection.
 */
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_ROOT = path.join(PROJECT_ROOT, 'src');
const STATIC_IMPORT = /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/gs;
const DYNAMIC_IMPORT = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

test('every relative source import resolves to an existing file', async () => {
	const sourceFiles = await collectJavaScript(SOURCE_ROOT);
	const missing = [];
	for (const sourceFile of sourceFiles) {
		const source = await readFile(sourceFile, 'utf8');
		for (const specifier of importSpecifiers(source)) {
			if (!specifier.startsWith('.')) {
				continue;
			}
			const importedPath = path.resolve(path.dirname(sourceFile), specifier);
			if (!(await isFile(importedPath))) {
				missing.push(`${path.relative(PROJECT_ROOT, sourceFile)} -> ${specifier}`);
			}
		}
	}
	assert.deepEqual(missing, []);
});

async function collectJavaScript(directory) {
	const files = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...await collectJavaScript(entryPath));
		} else if (entry.isFile() && entry.name.endsWith('.js')) {
			files.push(entryPath);
		}
	}
	return files;
}

function importSpecifiers(source) {
	const specifiers = [];
	for (const pattern of [STATIC_IMPORT, DYNAMIC_IMPORT]) {
		pattern.lastIndex = 0;
		for (const match of source.matchAll(pattern)) {
			specifiers.push(match[1]);
		}
	}
	return specifiers;
}

async function isFile(filePath) {
	try {
		return (await stat(filePath)).isFile();
	} catch {
		return false;
	}
}
