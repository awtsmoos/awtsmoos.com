//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mainMenuLoadingLifecycle.test.mjs
 * @description Locks menu and direct-world launch to the same strict page-owned loading-to-playable covenant.
 * The Awtsmoos joins one veil to one truthful threshold; Awtsmoos.com lets the menu hand diagnostics back,
 * so physical readiness closes the veil before the word playable can ever cross the final boundary.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const LAUNCHER_ROOT = new URL('../../launcher/', import.meta.url);
const source = name => readFile(new URL(name, LAUNCHER_ROOT), 'utf8');

test('page boot routes direct and menu gameplay through one strict finalizer', async () => {
	const boot = await source('bootMitzvahWorldPage.js');
	assert.match(boot, /const finalizeGameplay = diagnostics => publishMitzvahWorldPlayable/);
	assert.match(boot, /onWorldLaunchComplete: finalizeGameplay/);
	assert.match(boot, /if \(isMitzvahWorldGameplayDiagnostics\(launchedTiferes\)\)/);
	assert.match(boot, /finalizeGameplay\(launchedTiferes\)/);
	assert.match(boot, /loadingMalchus\.world\(updateOhr\)/);
});

test('launcher forwards selected-world completion authority into menu options', async () => {
	const launcher = await source('MitzvahWorldLauncher.js');
	assert.match(launcher, /onWorldLaunchComplete:\s*dependencies\.onWorldLaunchComplete/);
});

test('successful menu launch gives the finalizer the real runtime result before transition completion', async () => {
	const menu = await source('MainMenu.js');
	const publish = menu.indexOf('publishMainMenuRuntime(options.environment || globalThis, result)');
	const finalize = menu.indexOf('options.onWorldLaunchComplete?.(result)');
	const complete = menu.indexOf('transition.complete()');
	assert.ok(publish >= 0);
	assert.ok(finalize > publish);
	assert.ok(complete > finalize);
	assert.doesNotMatch(menu.slice(menu.indexOf('} catch (error)')), /onWorldLaunchComplete/);
});

test('strict publisher finishes and verifies the blocking overlay before runtime publication', async () => {
	const publisher = await source('MitzvahWorldPlayablePublisher.js');
	const finish = publisher.indexOf('loading.finish()');
	const overlay = publisher.indexOf('inspectMinimalMeadowOverlayDismissal(documentValue)');
	const playable = publisher.indexOf('markRuntimePlayable(diagnostics, documentValue)');
	const optional = publisher.indexOf('diagnostics.activatePostPlayable?.()');
	assert.ok(finish >= 0);
	assert.ok(overlay > finish);
	assert.ok(playable > overlay);
	assert.ok(optional > playable);
});
