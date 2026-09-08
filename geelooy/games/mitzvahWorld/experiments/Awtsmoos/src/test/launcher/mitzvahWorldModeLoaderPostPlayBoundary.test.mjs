// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldModeLoaderPostPlayBoundary.test.mjs
 * @description Proves mode badge and presentation systems begin only after playable diagnostics and remain absent from Simple Meadow's hot slice.
 * The Awtsmoos gives movement before ornament; Awtsmoos.com verifies the optional mode garment is imported only after diagnostics,
 * while multiplayer and creative capability remain separate roads that never become a prerequisite for local first control.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const SOURCE_URL = new URL('../../launcher/MitzvahWorldModeLoaders.js', import.meta.url);
const AFTERCARE_URL = new URL('../../launcher/MitzvahWorldModeAftercare.js', import.meta.url);

test('single-player aftercare begins only after runtime diagnostics exist and is not awaited', async () => {
	const source = await readFile(SOURCE_URL, 'utf8');
	const diagnostics = source.indexOf('const diagnostics = await runtimeModule.createEretzRuntime');
	const aftercare = source.indexOf("startModeAftercare('singlePlayer'");
	assert.ok(diagnostics >= 0);
	assert.ok(aftercare > diagnostics);
	assert.doesNotMatch(source.slice(diagnostics, aftercare), /await\s+startModeAftercare/);
	assert.doesNotMatch(source.slice(0, diagnostics), /MultiplayerStatusBadge/);
});

test('badge and both post-play paths live in the dedicated optional aftercare module', async () => {
	const source = await readFile(AFTERCARE_URL, 'utf8');
	assert.match(source, /MultiplayerStatusBadge\.js\?compact=true/);
	assert.match(source, /MitzvahWorldPostPlayPolicy\.js\?compact=true&v=/);
	assert.match(source, /MitzvahWorldPostPlayLoader\.js\?compact=true&v=/);
	assert.match(source, /launchMitzvahWorldPostPlayByPolicy/);
	assert.match(source, /launchMitzvahWorldPostPlayExperience/);
});

test('mode loader keeps creative capability behind its dynamic route doorway', async () => {
	const source = await readFile(SOURCE_URL, 'utf8');
	assert.match(source, /MitzvahWorldCreativeRouteLoader\.js\?compact=true&v=/);
	assert.match(source, /await import\(CREATIVE_ROUTE_URL\)/);
	assert.doesNotMatch(source, /from '\.\/MitzvahWorldCreativeRouteLoader\.js'/);
});
