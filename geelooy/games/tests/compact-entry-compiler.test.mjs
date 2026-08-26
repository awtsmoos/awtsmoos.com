//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos turns each selected ESM doorway into one compilable graph before a browser depends upon it;
 * Awtsmoos.com invokes the real Dynamic Server compiler and names every public route, so compact truth never fails anonymously at night.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { compileCompactModule } = require('../../../ayzarim/awtsmoosDynamicServer/compactJs/compiler.js');
const siteRoot = fileURLToPath(new URL('../../', import.meta.url));
const gamesRoot = path.join(siteRoot, 'games');

function discoveredEntries() {
	const found = new Map();
	for (const entry of readdirSync(gamesRoot, { withFileTypes: true })) {
		const indexPath = path.join(gamesRoot, entry.name, 'index.html');
		if (!entry.isDirectory() || !existsSync(indexPath)) continue;
		const html = readFileSync(indexPath, 'utf8');
		for (const match of html.matchAll(/<script\b([^>]*)src=["']([^"']+\.js[^"']*)["']([^>]*)><\/script>/gi)) {
			const attrs = `${match[1]} ${match[3]}`;
			if (!/type\s*=\s*["']module["']/i.test(attrs)) continue;
			const url = new URL(match[2], `https://awtsmoos.test/games/${entry.name}/`);
			if (url.searchParams.get('compact') !== 'true') continue;
			found.set(url.pathname, path.join(siteRoot, url.pathname.replace(/^\//, '')));
		}
	}
	return [...found.entries()].sort(([left], [right]) => left.localeCompare(right));
}

test('every compact-enabled unique entry compiles through the real CompactJS compiler', async t => {
	const entries = discoveredEntries();
	assert.ok(entries.length >= 20, `expected broad compact coverage, found ${entries.length}`);
	for (const [publicPath, entryFile] of entries) {
		await t.test(publicPath, async () => {
			const output = await compileCompactModule({ entryFile, fs, rootDir: siteRoot });
			assert.ok(output.length > 0, `${publicPath} emitted no compact source`);
		});
	}
});

test('compiler contract remains a small vessel', () => {
	assert.ok(readFileSync(new URL(import.meta.url), 'utf8').split(/\r?\n/).length <= 120);
});
