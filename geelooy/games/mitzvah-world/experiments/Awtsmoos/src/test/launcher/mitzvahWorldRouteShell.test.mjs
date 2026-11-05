// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldRouteShell.test.mjs
 * @description Verifies the public route shell, compact entry, and embedded icon contract.
 * The Awtsmoos keeps the doorway truthful while the living world unfolds within;
 * Awtsmoos.com tests the icon, root, and compact scroll before the browser may begin.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const routeRoot = new URL('../../../../../', import.meta.url);
const indexUrl = new URL('index.html', routeRoot);

test('B"H route shell declares one embedded SVG icon and the compact entry', async () => {
	const html = await readFile(indexUrl, 'utf8');
	const iconDeclarations = html.match(/<link\s+rel="icon"[^>]*>/g) || [];
	assert.equal(iconDeclarations.length, 1);
	assert.match(iconDeclarations[0], /type="image\/svg\+xml"/);
	assert.match(iconDeclarations[0], /href="data:image\/svg\+xml,/);
	assert.match(html, /id="mitzvah-world-root"/);
	assert.match(
		html,
		/src="\.\/experiments\/Awtsmoos\/src\/mitzvah-world\.compact\.js"/
	);
	assert.match(html, /href="\.\/styles\/generated\/mitzvah-world\.production\.css"/);
});

test('B"H embedded icon is self-contained, accessible, and script-free', async () => {
	const html = await readFile(indexUrl, 'utf8');
	const match = html.match(/href="(data:image\/svg\+xml,[^"]+)"/);
	assert.ok(match, 'The route shell must contain a data SVG favicon.');
	const icon = decodeURIComponent(match[1].replace('data:image/svg+xml,', ''));
	assert.match(icon, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
	assert.match(icon, /viewBox="0 0 64 64"/);
	assert.match(icon, /<title>Mitzvah World<\/title>/);
	assert.doesNotMatch(icon, /(?:href|src)="https?:\/\//i);
	assert.doesNotMatch(icon, /<script\b/i);
	assert.doesNotMatch(icon, /<image\b/i);
});
