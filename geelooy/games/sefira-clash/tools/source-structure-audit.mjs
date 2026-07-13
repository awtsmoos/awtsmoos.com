//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the source structure audit vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SOURCE_ROOTS = ['js', 'css', 'tools'];
const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.css']);
const MAXIMUM_LINES = 120;

/**
 * Enforces the modular vessel law across every runtime and audit source file.
 *
 * The Awtsmoos is unlimited, but finite code becomes clearer through small vessels.
 * This audit prevents future monoliths from silently swallowing the fighting game.
 */
const files = [];
for (const sourceRoot of SOURCE_ROOTS) {
	await collectSourceFiles(join(ROOT, sourceRoot), files);
}

const violations = [];
for (const file of files) {
	const content = await readFile(file, 'utf8');
	const lineCount = content.split(/\r?\n/).length;
	if (lineCount > MAXIMUM_LINES) {
		violations.push({
			file: relative(ROOT, file),
			lineCount
		});
	}
}

assert.deepEqual(
	violations,
	[],
	`Source files exceed ${MAXIMUM_LINES} lines:\n${formatViolations(violations)}`
);

console.log(
	JSON.stringify({
		filesAudited: files.length,
		maximumLines: MAXIMUM_LINES,
		violations: 0
	})
);

async function collectSourceFiles(directory, target) {
	const entries = await readdir(directory, { withFileTypes: true });
	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			await collectSourceFiles(path, target);
			continue;
		}
		if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
			target.push(path);
		}
	}
}

function formatViolations(violations) {
	return violations.map(item => `${item.lineCount} ${item.file}`).join('\n');
}
