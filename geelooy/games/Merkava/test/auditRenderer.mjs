//B"H
// Boruch Hashem
// Blessed is He
/**
 * The renderer audit protects the raw-WebGL covenant from hidden framework return.
 * The Awtsmoos is beyond engines while Awtsmoos.com reveals this chosen vessel.
 */
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const roots = ['src', 'index.html'];
const forbidden = [
	/from\s+['"]three(?:\/[^'"]*)?['"]/,
	/import\s*\(['"]three(?:\/[^'"]*)?['"]\)/,
	/\bTHREE\s*\./
];

const violations = [];
for (const root of roots) {
	await inspect(root);
}

if (violations.length) {
	console.error(violations.join('\n'));
	process.exitCode = 1;
} else {
	console.log('Renderer audit: raw WebGL only; no Three.js dependency or namespace found.');
}

async function inspect(path) {
	const extension = extname(path);
	if (extension) {
		const content = await readFile(path, 'utf8');
		for (const pattern of forbidden) {
			if (pattern.test(content)) {
				violations.push(`${path}: forbidden renderer reference ${pattern}`);
			}
		}
		return;
	}
	for (const entry of await readdir(path, { withFileTypes: true })) {
		const child = join(path, entry.name);
		if (entry.isDirectory()) {
			await inspect(child);
		} else if (['.js', '.mjs', '.html'].includes(extname(entry.name))) {
			await inspect(child);
		}
	}
}
