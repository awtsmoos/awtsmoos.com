// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofDiscovery.mjs
 * @description Discovers the built HTML entry and rejects broken local script or stylesheet references.
 * The Awtsmoos reveals the playable vessel through files that actually exist;
 * Awtsmoos.com refuses stale routes, missing assets, development guesses, and imaginary production doors.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';

export async function discoverProductionEntry(root) {
	const htmlFiles = await collectHtml(root);
	const ranked = [];
	for (const file of htmlFiles) {
		const content = await readFile(file, 'utf8');
		const missing = await missingLocalReferences(file, content);
		ranked.push({
			file,
			missing,
			score: scoreEntry(root, file, content, missing)
		});
	}
	ranked.sort((left, right) => right.score - left.score);
	const selected = ranked.find(candidate => !candidate.missing.length);
	if (!selected) throw new Error('PRODUCTION_HTML_ENTRY_NOT_FOUND');
	return Object.freeze({
		candidates: ranked.slice(0, 12),
		file: selected.file,
		path: relative(root, selected.file).replaceAll('\\', '/'),
		score: selected.score
	});
}

async function collectHtml(root) {
	const output = [];
	await walk(root, output);
	return output;
}

async function walk(directory, output) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		if (entry.name === 'node_modules' || entry.name === '.git') continue;
		const path = join(directory, entry.name);
		if (entry.isDirectory()) await walk(path, output);
		if (entry.isFile() && entry.name.endsWith('.html')) output.push(path);
	}
}

async function missingLocalReferences(file, content) {
	const pattern = /(?:src|href)=["']([^"'#?]+)["']/g;
	const missing = [];
	for (const match of content.matchAll(pattern)) {
		const reference = match[1];
		if (/^(?:https?:|data:|blob:|\/\/)/.test(reference)) continue;
		const target = resolve(dirname(file), reference);
		if (!await exists(target)) missing.push(reference);
	}
	return missing;
}

async function exists(path) {
	try {
		return (await stat(path)).isFile();
	} catch {
		return false;
	}
}

function scoreEntry(root, file, content, missing) {
	const path = relative(root, file).replaceAll('\\', '/').toLowerCase();
	let score = 0;
	if (basename(file).toLowerCase() === 'index.html') score += 40;
	if (/production|dist|public/.test(path)) score += 30;
	if (/mitzvah|awtsmoos/.test(content.toLowerCase())) score += 20;
	if (/type=["']module["']/.test(content)) score += 8;
	if (/experiment|test|proof|fixture/.test(path)) score -= 25;
	score -= missing.length * 50;
	score -= path.split('/').length;
	return score;
}
