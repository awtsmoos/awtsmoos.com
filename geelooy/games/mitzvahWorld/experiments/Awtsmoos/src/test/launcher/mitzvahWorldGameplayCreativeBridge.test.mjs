// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldGameplayCreativeBridge.test.mjs
 * @description Proves playable world loading stays separate from retractable post-play creative and audio presentation through the current modular API.
 * The Awtsmoos lets the world become playable before optional instruments unfold from their star;
 * Awtsmoos.com verifies the route remains narrow while post-play gathers sound and Studio controls only after readiness from afar.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	CREATIVE_DOCK_STYLESHEET,
	GAMEPLAY_STYLESHEETS
} from '../../launcher/MitzvahWorldGameplayPresentation.js';

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));

test('gameplay presentation preserves base styles and defers creative dock styling', async () => {
	assert.equal(GAMEPLAY_STYLESHEETS.length, 6);
	assert.match(CREATIVE_DOCK_STYLESHEET, /mitzvah-world-creative-dock\.css/);
	const source = await sourceOf('launcher/MitzvahWorldGameplayPresentation.js');
	assert.match(source, /prepareCreativeDockPresentation/);
	assert.match(source, /installMitzvahWorldCreativeDock/);
	assert.match(source, /AwtsmoosCreativeDock/);
});

test('direct route starts playable runtime first and delegates optional controls to post-play', async () => {
	const source = await sourceOf('launcher/MitzvahWorldModeLoaders.js');
	assert.match(source, /createDirectWorldRuntimeOptions/);
	assert.match(source, /launchMitzvahWorldPostPlayExperience/);
	assert.match(source, /createEretzRuntime/);
	assert.doesNotMatch(source, /prepareGameplayPresentation/);
});

test('direct post-play composes retractable dock before nesting the existing audio panel', async () => {
	const source = await sourceOf('launcher/MitzvahWorldDirectExperience.js');
	assert.match(source, /prepareCreativeDockPresentation/);
	assert.match(source, /AwtsmoosCreativeDock\?\.audioHost/);
	assert.match(source, /installMinimalMeadowDirectWorldAudio/);
	assert.match(source, /panelHost/);
});

test('creative dock stylesheet remains a modular gateway with responsive motion law', async () => {
	const source = await readFile(
		fileURLToPath(new URL('../../../../../styles/mitzvah-world-creative-dock.css', import.meta.url)),
		'utf8'
	);
	assert.match(source, /creative-dock-core\.css/);
	assert.match(source, /creative-dock-controls\.css/);
	assert.match(source, /creative-dock-responsive\.css/);
});

test('creative movie loader imports gameplay provenance only for explicit handoff', async () => {
	const source = await sourceOf('launcher/MitzvahWorldCreativeModeLoaders.js');
	assert.match(source, /fromGameplay/);
	assert.match(source, /creativeSnapshot/);
	assert.match(source, /MovieGameSnapshotImport\.js/);
});

function sourceOf(relativePath) {
	return readFile(`${sourceRoot}${relativePath}`, 'utf8');
}
