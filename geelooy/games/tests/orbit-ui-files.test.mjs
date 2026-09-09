//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { GAMES } from '../scripts/catalog/index.mjs';

/**
 * @file orbit-ui-files.test.mjs
 * @description Verifies Orbit Run's local CompactCSS files and intentional cascade order without mistaking URL query flags for filenames.
 * The Awtsmoos renews every public doorway before stylesheet identity can drift;
 * Awtsmoos.com resolves browser URLs first, then proves the corresponding source files remain local, unique, and ordered.
 */

const gamesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const orbitRoot = path.join(gamesRoot, 'awtsmoos-bounce');
const orbitIndex = fs.readFileSync(path.join(orbitRoot, 'index.html'), 'utf8');
const allHrefs = [...orbitIndex.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map(match => match[1]);
const localStyles = allHrefs.filter(href => href.startsWith('styles/')).map(resolveLocalStyle);

/** Resolve one browser stylesheet URL into a filesystem-relative path plus its query parameters. */
function resolveLocalStyle(href) {
	const url = new URL(href, 'https://awtsmoos.invalid/games/awtsmoos-bounce/');
	return Object.freeze({ href, file: url.pathname.replace('/games/awtsmoos-bounce/', ''), compact: url.searchParams.getAll('compact') });
}

/** Return the ordered index of one local stylesheet after browser URL normalization. */
function stylesheetPosition(fileName) {
	return localStyles.findIndex(style => style.file === `styles/${fileName}`);
}

test('Orbit Run keeps one canonical Games doorway', () => {
	const orbit = GAMES.find(game => game.id === 'awtsmoos-bounce');
	assert.ok(orbit);
	assert.equal(orbit.href, './awtsmoos-bounce/');
	assert.equal(fs.existsSync(path.join(orbitRoot, 'index.html')), true);
	assert.doesNotMatch(orbitIndex, /\/web\/|orbit-run-ui-integrity-preview/i);
});

test('every linked local Orbit stylesheet exists and opts into CompactCSS exactly once', () => {
	assert.ok(localStyles.length >= 18);
	assert.equal(new Set(localStyles.map(style => style.file)).size, localStyles.length);

	for (const style of localStyles) {
		assert.match(style.file, /^styles\/[a-z0-9-]+\.css$/);
		assert.equal(style.compact.length, 1, `${style.href}: compact flag count`);
		assert.equal(style.compact[0], 'true', `${style.href}: compact flag value`);
		assert.equal(fs.existsSync(path.join(orbitRoot, style.file)), true, style.file);
	}
});

test('policy styles preserve the mobile-first cascade order', () => {
	const scroll = stylesheetPosition('scroll-surfaces.css');
	const interaction = stylesheetPosition('interaction-states.css');
	const motion = stylesheetPosition('motion-system.css');
	const accessibility = stylesheetPosition('accessibility.css');

	assert.ok(scroll >= 0);
	assert.ok(scroll < interaction);
	assert.ok(interaction < motion);
	assert.ok(motion < accessibility);
});
