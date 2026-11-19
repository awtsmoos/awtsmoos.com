//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mitzvahWorldDirectPlayPresentation.test.mjs
 * @description Guards staged direct-play presentation so Bag visibility reuses canonical state without importing forbidden world systems.
 * The Awtsmoos reveals one living store beneath rail and panel; Awtsmoos.com tests that presentation projects truth without creating a rival inventory.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const adapterPath = fileURLToPath(new URL('../../launcher/MitzvahWorldDirectPlayPresentation.js', import.meta.url));
const experiencePath = fileURLToPath(new URL('../../launcher/MitzvahWorldDirectExperience.js', import.meta.url));
const retractablePath = fileURLToPath(new URL('../../ui/MinimalMeadowRetractable.js', import.meta.url));

test('direct play presentation projects staged inventory onto cinematic rail and Bag only', async () => {
	const [adapter, experience, retractable] = await Promise.all([
		readFile(adapterPath, 'utf8'),
		readFile(experiencePath, 'utf8'),
		readFile(retractablePath, 'utf8')
	]);
	assert.match(adapter, /createMitzvahWorldDirectInventoryProjection/);
	assert.match(adapter, /runtime\.inventoryStore/);
	assert.match(adapter, /new InventoryPanel\(inventoryHost, runtime\.bus/);
	assert.match(adapter, /createInventoryModalHost\(documentValue\)/);
	assert.match(adapter, /MinimalMeadowCinematicPresentation/);
	assert.match(adapter, /MinimalMeadowGameRail/);
	assert.match(adapter, /installMinimalMeadowShellRetractables/);
	assert.match(adapter, /installMinimalMeadowShellRetractables\(runtime, documentValue\)/);
	assert.match(adapter, /from '\.\.\/ui\/MinimalMeadowRetractable\.js'/);
	assert.match(adapter, /mobileRetract\?\.destroy/);
	assert.match(adapter, /playerRetract\?\.destroy/);
	assert.match(adapter, /runtime\.bus/);
	assert.match(adapter, /canonicalStoreReused/);
	assert.match(adapter, /inventoryPanelOwned/);
	assert.match(adapter, /runtime\.directPlayPresentation\?\.destroy\?\.\(\)/);
	assert.match(adapter, /runtime\.directPlayPresentation = handle/);
	assert.match(adapter, /inventoryHost\.remove/);
	assert.match(adapter, /initialRunMode:\s*Boolean\(runtime\.state\?\.runMode\)/);
	for (const forbidden of [
		'new InventoryStore',
		'MinimalMeadowCoordinatedUi',
		'MinimalMeadowWorldSystems',
		'NpcHud',
		'ThreatIndicator',
		'WorldMinimap',
		'TargetFrame',
		'DamageFeedback'
	]) {
		assert.doesNotMatch(adapter, new RegExp(forbidden));
	}
	assert.match(experience, /MitzvahWorldDirectPlayPresentation\.js/);
	assert.match(experience, /startMitzvahWorldDirectPlayPresentation\(diagnostics, environment\)/);
	assert.match(experience, /directPlayPresentation/);
	assert.match(retractable, /export function installMinimalMeadowShellRetractables/);
	assert.match(retractable, /shellFor\(runtime, documentValue, 'mobileShell', '#mobileControls'\)/);
	assert.match(retractable, /shellFor\(runtime, documentValue, 'playerHudShell', '#playerHudShell'\)/);
	assert.match(retractable, /runtime\[key\] \?\? new MinimalMeadowRetractable/);
});
