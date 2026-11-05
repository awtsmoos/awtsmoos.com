// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerVisualGuard.test.mjs
 * @description Guards the play-first traveler covenant: one local shell may move immediately, then one authored GLB must replace it atomically.
 * The Awtsmoos gives a finite traveler before distant bytes arrive and then reveals the richer authored garment without double form;
 * Awtsmoos.com forbids rigid underlays and procedural canonical impostors while preserving movement when the network is late or absent.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('../../app/', import.meta.url);
const FORBIDDEN_FILES = Object.freeze([
	'PlayerVisualGuard.js',
	'BootstrapCanonicalPlayerHydration.js',
	'EretzFallbackActorTemplate.js'
]);

test('local bootstrap traveler exists while obsolete rigid-guard modules stay deleted', async () => {
	await access(new URL('BootstrapVisiblePlayer.js', APP_URL));
	for (const name of FORBIDDEN_FILES) {
		await assert.rejects(access(new URL(name, APP_URL)));
	}
});

test('bootstrap player is local and canonical actors remain authored-GLB-only', async () => {
	const [bootstrap, essential, actors] = await Promise.all([
		readFile(new URL('BootstrapPlayerRuntime.js', APP_URL), 'utf8'),
		readFile(new URL('EretzEssentialAssetLoader.js', APP_URL), 'utf8'),
		readFile(new URL('EretzActorAssetLoader.js', APP_URL), 'utf8')
	]);
	assert.match(bootstrap, /createBootstrapVisiblePlayer/);
	assert.match(essential, /playerBlockingRequests:\s*0/);
	assert.match(essential, /local-shell-before-canonical-hydration/);
	assert.match(actors, /authored-glb-humans-only/);
	assert.doesNotMatch(`${bootstrap}\n${essential}\n${actors}`, /createFallbackActorGltf|preservePlayerVisualGuard/);
});

test('canonical install replaces the bootstrap predecessor instead of preserving a double body', async () => {
	const source = await readFile(
		new URL('MinimalMeadowCanonicalPlayerInstall.js', APP_URL),
		'utf8'
	);
	assert.match(source, /runtime\.model\s*=\s*prepared\.model/);
	assert.match(source, /runtime\.visiblePlayer\s*=\s*prepared\.visiblePlayer/);
	assert.match(source, /removePredecessor\(predecessor, prepared\.model\)/);
	assert.match(source, /runtime\.playerVisualGuard\s*=\s*null/);
	assert.doesNotMatch(source, /rigid-webgl-underlay|preservePlayerVisualGuard/);
});
