//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Proves long-press multi-selection and real folder organization in the living Drive DOM.
 * @description The Awtsmoos gives one file world many deliberate gestures without division;
 * Awtsmoos.com proves selection, folder choice, mutation, and responsive safety in one witness.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDriveBrowserHarness } from './DriveBrowserHarness.mjs';
import { waitForDrive } from './driveV5BrowserAssertions.mjs';
import { showList } from './driveV5BrowserActions.mjs';
import { setViewport } from './driveV5BrowserVisualActions.mjs';
import {
	commitMove,
	createChooserFolder,
	enterChooserFolder,
	inspectChooser,
	inspectSelection,
	longPress,
	openMoveChooser,
	promoteDesktopSelection,
	toggleEntry
} from './driveSelectionBrowserActions.mjs';
import { SIMPLE_DRIVE_FIXTURE } from './simpleDriveBrowserFixture.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const evidence = path.resolve(here, '../../../../.ai-thoughts/2026-09-18-0134-drive-selection-organization/screenshots');
fs.mkdirSync(evidence, { recursive: true });
const origin = process.env.AWTSMOOS_DRIVE_TEST_ORIGIN || 'http://127.0.0.1:18080';
const harness = await createDriveBrowserHarness({ origin });
const fixture = (await harness.client.send('Page.addScriptToEvaluateOnNewDocument', { source: SIMPLE_DRIVE_FIXTURE })).identifier;

async function screenshot(name) {
	await harness.screenshot(path.join(evidence, name));
}

try {
	await setViewport(harness.client, 390, 844);
	await harness.navigate('/apps/drive/');
	await waitForDrive(harness.client);
	await showList(harness.client);
	await longPress(harness.client, 'styles.css');
	let selection = await inspectSelection(harness.client);
	assert.equal(selection.count, 1, JSON.stringify(selection));
	assert.deepEqual(selection.paths, ['styles.css'], JSON.stringify(selection));
	assert.equal(selection.textSelection, '', JSON.stringify(selection));
	assert.equal(selection.userSelect, 'none', JSON.stringify(selection));
	assert.equal(selection.dockDisplay, 'none', JSON.stringify(selection));
	assert.equal(selection.barVisible, true, JSON.stringify(selection));
	assert.equal(selection.overflow, 0, JSON.stringify(selection));
	await toggleEntry(harness.client, 'app.js');
	selection = await inspectSelection(harness.client);
	assert.equal(selection.count, 2, JSON.stringify(selection));
	await screenshot('drive-selection-390.png');
	await setViewport(harness.client, 320, 844);
	assert.equal((await inspectSelection(harness.client)).overflow, 0);
	await screenshot('drive-selection-320.png');
	await setViewport(harness.client, 430, 932);
	assert.equal((await inspectSelection(harness.client)).overflow, 0);
	await screenshot('drive-selection-430.png');

	await setViewport(harness.client, 390, 844);
	await openMoveChooser(harness.client);
	let chooser = await inspectChooser(harness.client);
	assert.equal(chooser.mainPath, '', JSON.stringify(chooser));
	assert(chooser.folders.includes('Projects'), JSON.stringify(chooser));
	assert.equal(chooser.upDisabled, true, JSON.stringify(chooser));
	await enterChooserFolder(harness.client, 'Projects');
	chooser = await inspectChooser(harness.client);
	assert.equal(chooser.mainPath, '', JSON.stringify(chooser));
	await createChooserFolder(harness.client, 'Selected');
	chooser = await inspectChooser(harness.client);
	assert.match(chooser.location, /Projects\/Selected/);
	assert.equal(chooser.mainPath, '', JSON.stringify(chooser));
	await screenshot('drive-folder-chooser-390.png');
	await commitMove(harness.client);
	const moved = await harness.client.evaluate(`window.__driveFixtureEntries.map(entry => entry.path)`);
	assert(moved.includes('Projects/Selected/styles.css'), JSON.stringify(moved));
	assert(moved.includes('Projects/Selected/app.js'), JSON.stringify(moved));
	selection = await inspectSelection(harness.client);
	assert.equal(selection.mode, 'idle', JSON.stringify(selection));
	assert.notEqual(selection.dockDisplay, 'none', JSON.stringify(selection));

	await setViewport(harness.client, 1366, 900);
	await harness.navigate('/apps/drive/');
	await waitForDrive(harness.client);
	await harness.client.evaluate(`document.querySelector('#view-grid')?.click()`);
	await promoteDesktopSelection(harness.client, 'index.html');
	selection = await inspectSelection(harness.client);
	assert.equal(selection.count, 1, JSON.stringify(selection));
	assert.equal(selection.barVisible, true, JSON.stringify(selection));
	assert.equal(await harness.client.evaluate(`document.querySelector('#drive-details')?.hidden`), true);
	await screenshot('drive-selection-desktop.png');
	assert.deepEqual(harness.errors, [], JSON.stringify(harness.errors));
	console.log('B"H Drive selection and organization browser proof passed');
} finally {
	await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: fixture }).catch(() => null);
	await harness.close();
}
