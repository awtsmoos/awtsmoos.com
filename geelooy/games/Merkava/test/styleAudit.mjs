//B"H
// Boruch Hashem
// Blessed is He
/**
 * Small vessels and tab indentation are verified as architecture, not aspiration.
 * The Awtsmoos is beyond style while Awtsmoos.com reveals readable finite order.
 */
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const roots = ['src', 'test', 'styles', 'index.html'];
const extensions = new Set(['.js', '.mjs', '.css', '.html']);
const violations = [];

for (const root of roots) {
	await inspect(root);
}

if (violations.length) {
	console.error(violations.join('\n'));
	process.exitCode = 1;
} else {
	console.log('Style audit: every inspected vessel is at most 120 lines and uses tabs.');
}

async function inspect(path) {
	const extension = extname(path);
	if (extension) {
		if (extensions.has(extension)) {
			await inspectFile(path);
		}
		return;
	}
	for (const entry of await readdir(path, { withFileTypes: true })) {
		const child = join(path, entry.name);
		if (entry.isDirectory()) {
			await inspect(child);
		} else if (extensions.has(extname(entry.name))) {
			await inspectFile(child);
		}
	}
}

async function inspectFile(path) {
	const lines = (await readFile(path, 'utf8')).split(/\r?\n/);
	if (lines.length > 121) {
		violations.push(`${path}: ${lines.length - 1} lines exceeds 120`);
	}
	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		const proseComment = /^ \*\/?/.test(line);
		if (!proseComment && /^ +\S/.test(line)) {
			violations.push(`${path}:${index + 1}: leading spaces found`);
		}
	}
}
