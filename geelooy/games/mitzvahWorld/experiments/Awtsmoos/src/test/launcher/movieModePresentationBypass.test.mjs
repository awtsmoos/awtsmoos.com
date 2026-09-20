//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file movieModePresentationBypass.test.mjs
 * @description Guards Movie Studio from full gameplay presentation while richer creative routes retain it.
 * The Awtsmoos renews each doorway according to its purpose; Awtsmoos.com lets cinema enter
 * directly while materials and platform intentionally receive the fuller gameplay garment.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const loaderPath = fileURLToPath(new URL('../../launcher/MitzvahWorldModeLoaders.js', import.meta.url));
const routePath = fileURLToPath(new URL('../../launcher/MitzvahWorldCreativeRouteLoader.js', import.meta.url));

test('movie mode bypasses gameplay presentation while other creative modes preserve it', async () => {
	const [loaderSource, routeSource] = await Promise.all([
		readFile(loaderPath, 'utf8'),
		readFile(routePath, 'utf8')
	]);
	assert.match(loaderSource, /movie:\s*\(hosts, options\) => openCreative\('movie'/);
	assert.match(loaderSource, /materials: hosts => openCreative\('materials'/);
	assert.match(loaderSource, /platform: hosts => openCreative\('platform'/);
	assert.match(loaderSource, /if \(kind === 'movie'\) return module\.openMitzvahWorldMovieCreative/);
	assert.match(routeSource, /openMitzvahWorldMovieCreative[\s\S]*?openMovieMode/);
	const movieBody = routeSource.match(/export async function openMitzvahWorldMovieCreative[\s\S]*?\n\}/)?.[0] || '';
	assert.doesNotMatch(movieBody, /startMitzvahWorldFullPresentation/);
	assert.match(routeSource, /openPresentedMitzvahWorldCreative[\s\S]*?startMitzvahWorldFullPresentation/);
});
