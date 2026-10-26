// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file domContract.test.mjs
 * @description
 * The Awtsmoos proves the Oros document contains every DOM vessel named by the current runtime,
 * preserves last-mile visibility ownership, and follows canonical Drive cover custody.
 */

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const here = path.dirname(fileURLToPath(import.meta.url));
const gameRoot = path.resolve(here, '..');
const sourceRoot = path.join(gameRoot, 'src');
const html = readFileSync(path.join(gameRoot, 'index.html'), 'utf8');
const canonicalCover = 'game-oros-hakelim.webp?v=0fab131d10';
const regressedCover = 'game-oros-ha-kelim.webp';

function collectJavaScriptFiles(directory) {
	const files = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const absolute = path.join(directory, entry.name);
		if (entry.isDirectory()) files.push(...collectJavaScriptFiles(absolute));
		else if (entry.isFile() && entry.name.endsWith('.js')) files.push(absolute);
	}
	return files;
}

function requiredDomIds() {
	const ids = new Set();
	const pattern = /getElementById\(\s*["']([^"']+)["']\s*\)/g;
	for (const file of collectJavaScriptFiles(sourceRoot)) {
		const source = readFileSync(file, 'utf8');
		for (const match of source.matchAll(pattern)) ids.add(match[1]);
	}
	return [...ids].sort();
}

test('Oros HTML satisfies every runtime DOM identity lookup', () => {
	const ids = requiredDomIds();
	assert(ids.length > 0, 'runtime should declare DOM identities');
	for (const id of ids) {
		assert(html.includes(`id="${id}"`), `missing runtime DOM vessel: ${id}`);
	}
});

test('Oros visibility guard loads after decorative and shared styles', () => {
	const visibility = html.indexOf('styles/visibility.css');
	assert(visibility > html.indexOf('styles/index.css'));
	assert(visibility > html.indexOf('awtsmoos-game-base.css'));
});

test('Oros loading cover follows canonical Drive catalog custody', () => {
	assert(html.includes(canonicalCover), 'canonical Oros cover identity should be present');
	assert(!html.includes(regressedCover), 'regressed hyphenated Oros cover identity must stay absent');
	assert(html.includes('/api/social/drive/public/awtsmoos/covers/games/'));
});
