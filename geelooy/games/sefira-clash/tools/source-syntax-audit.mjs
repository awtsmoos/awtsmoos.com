//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the source syntax audit vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SOURCE_ROOTS = ['js', 'tools'];
const JAVASCRIPT_EXTENSIONS = new Set(['.js', '.mjs']);

/**
 * Parses every JavaScript vessel, including browser modules outside Node smoke paths.
 *
 * The Awtsmoos renews meaning through exact letters; one malformed bracket can hide
 * an entire world, so every source file must pass the language parser before release.
 */
const files = [];
for (const sourceRoot of SOURCE_ROOTS) {
	await collectJavaScriptFiles(join(ROOT, sourceRoot), files);
}

const failures = [];
for (const file of files) {
	const result = spawnSync(process.execPath, ['--check', file], {
		encoding: 'utf8'
	});
	if (result.status !== 0) {
		failures.push({
			file: relative(ROOT, file),
			error: result.stderr.trim()
		});
	}
}

assert.deepEqual(failures, [], `JavaScript syntax failures:\n${formatFailures(failures)}`);

console.log(
	JSON.stringify({
		filesParsed: files.length,
		failures: 0
	})
);

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

function formatFailures(failures) {
	return failures.map(item => `${item.file}\n${item.error}`).join('\n\n');
}
