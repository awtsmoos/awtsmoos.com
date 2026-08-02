// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	CREATIVE_DOCK_STYLESHEET,
	GAMEPLAY_STYLESHEETS
} from '../../launcher/MitzvahWorldGameplayPresentation.js';

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));

test('gameplay presentation preserves six base styles and defers the creative dock', async () => {
	assert.equal(GAMEPLAY_STYLESHEETS.length, 6);
	assert.match(CREATIVE_DOCK_STYLESHEET, /mitzvah-world-creative-dock\.css/);
	const source = await readFile(`${sourceRoot}launcher/MitzvahWorldGameplayPresentation.js`, 'utf8');
	assert.match(source, /prepareCreativeDockPresentation/);
	assert.match(source, /installMitzvahWorldCreativeDock/);
	assert.match(source, /AwtsmoosCreativeDock/);
});

test('direct worlds install only the lightweight creative dock after runtime readiness', async () => {
	const source = await readFile(`${sourceRoot}launcher/MitzvahWorldModeLoaders.js`, 'utf8');
	assert.match(source, /prepareCreativeDockPresentation/);
	assert.match(source, /await startCreativeDock\(environment\)/);
	assert.match(source, /prepareGameplayPresentation/);
});

test('creative movie loader imports gameplay provenance only for explicit handoff', async () => {
	const source = await readFile(`${sourceRoot}launcher/MitzvahWorldCreativeModeLoaders.js`, 'utf8');
	assert.match(source, /fromGameplay/);
	assert.match(source, /creativeSnapshot/);
	assert.match(source, /MovieGameSnapshotImport\.js/);
});
