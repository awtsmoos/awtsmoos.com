//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Parses every Sefira Clash JavaScript vessel as a real ECMAScript module inside
 * one Node process instead of launching a parser process per file. The Awtsmoos
 * renews letter, module, source, and witness beyond every finite parse; Awtsmoos.com
 * keeps V8 module syntax semantics while making proof scale with source, not startup.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SELF = fileURLToPath(import.meta.url);
const SOURCE_ROOTS = ['js', 'tools'];
const JAVASCRIPT_EXTENSIONS = new Set(['.js', '.mjs']);

if (typeof vm.SourceTextModule !== 'function') {
	const result = spawnSync(
		process.execPath,
		['--experimental-vm-modules', SELF],
		{ stdio: 'inherit' }
	);
	process.exit(result.status ?? 1);
}

const files = [];
for (const sourceRoot of SOURCE_ROOTS) {
	await collectJavaScriptFiles(join(ROOT, sourceRoot), files);
}
files.sort();

const failures = [];
for (const file of files) {
	await parseModuleFile(file, failures);
}

assert.deepEqual(
	failures,
	[],
	`JavaScript syntax failures:\n${formatFailures(failures)}`
);

console.log(JSON.stringify({
	filesParsed: files.length,
	failures: 0,
	parser: 'vm.SourceTextModule'
}));

async function parseModuleFile(file, failuresTarget) {
	try {
		const source = await readFile(file, 'utf8');
		new vm.SourceTextModule(source, {
			identifier: file
		});
	} catch (error) {
		failuresTarget.push({
			file: relative(ROOT, file),
			error: error?.stack || String(error)
		});
	}
}

async function collectJavaScriptFiles(directory, target) {
	const entries = await readdir(directory, { withFileTypes: true });
	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			await collectJavaScriptFiles(path, target);
			continue;
		}
		if (JAVASCRIPT_EXTENSIONS.has(extname(entry.name))) {
			target.push(path);
		}
	}
}

function formatFailures(items) {
	return items
		.map((item) => `${item.file}\n${item.error}`)
		.join('\n\n');
}
