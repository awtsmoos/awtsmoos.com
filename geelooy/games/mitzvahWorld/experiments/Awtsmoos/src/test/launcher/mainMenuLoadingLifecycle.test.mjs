//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mainMenuLoadingLifecycle.test.mjs
 * @description Locks the selected-world loading veil to one balanced open/success-close transaction across page boot, launcher, and menu.
 * The Awtsmoos lets Awtsmoos.com name one threshold owner: blocking progress may reveal the veil for intentional entry,
 * but successful runtime publication must return to that same owner and finish the veil before gameplay is exposed.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const LAUNCHER_ROOT = new URL('../../launcher/', import.meta.url);
const source = name => readFile(new URL(name, LAUNCHER_ROOT), 'utf8');

test('page boot gives selected-world success the original loading-screen finish authority', async () => {
	const boot = await source('bootMitzvahWorldPage.js');
	assert.match(boot, /onWorldLaunchComplete:\s*\(\) => loadingMalchus\.finish\(\)/);
	assert.match(boot, /onProgress:\s*updateOhr =>/);
	assert.match(boot, /loadingMalchus\.world\(updateOhr\)/);
});

test('launcher forwards the selected-world completion callback into menu options', async () => {
	const launcher = await source('MitzvahWorldLauncher.js');
	assert.match(
		launcher,
		/onWorldLaunchComplete:\s*dependencies\.onWorldLaunchComplete/
	);
});

test('successful menu launch publishes runtime before dismissing the blocking veil', async () => {
	const menu = await source('MainMenu.js');
	const publish = menu.indexOf('publishMainMenuRuntime(options.environment || globalThis, result)');
	const finish = menu.indexOf('options.onWorldLaunchComplete?.(result)');
	const complete = menu.indexOf('transition.complete()');
	assert.ok(publish >= 0);
	assert.ok(finish > publish);
	assert.ok(complete > finish);
	assert.doesNotMatch(menu.slice(menu.indexOf('} catch (error)')), /onWorldLaunchComplete/);
});
