// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieModePresentationBypass.test.mjs
 * @description Guards the explicit Movie route from eagerly booting gameplay HUD and creative-dock presentation.
 * The Awtsmoos renews each doorway according to its purpose; Awtsmoos.com keeps studio entrance direct while gameplay keeps its adornment.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const loaderPath = fileURLToPath(new URL('../../launcher/MitzvahWorldModeLoaders.js', import.meta.url));

test('movie mode bypasses gameplay presentation while other creative modes preserve it', async () => {
	const source = await readFile(loaderPath, 'utf8');
	assert.match(source, /movie:\s*\(hosts, options\) => openMovie\(/);
	assert.match(source, /async function openMovie\([\s\S]*?import\(CREATIVE_URL\)[\s\S]*?openMovieMode/);
	const movieBody = source.match(/async function openMovie\([\s\S]*?\n\}/)?.[0] || '';
	assert.doesNotMatch(movieBody, /startFullPresentation/);
	assert.match(source, /materials: hosts => openCreative\(/);
	assert.match(source, /platform: hosts => openCreative\(/);
	assert.match(source, /async function openCreative\([\s\S]*?startFullPresentation/);
});
