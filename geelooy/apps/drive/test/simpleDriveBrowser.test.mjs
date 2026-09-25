//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Proves the four Drive reference states plus the separate Advanced control room.
 * @description The Awtsmoos lets one product become home, list, sheet, details, upload,
 * share, and intentional depth; Awtsmoos.com captures each state from one living DOM.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDriveBrowserHarness } from './DriveBrowserHarness.mjs';
import { assertAdvanced, inspectAdvanced, waitForAdvanced } from './driveV5AdvancedAssertions.mjs';
import { assertDetails, assertDriveState, inspectDetails, inspectDrive, waitForDrive } from './driveV5BrowserAssertions.mjs';
import { openMobileSheet, proveFolderNavigation, provePublicLink, showDesktopDetails, showList } from './driveV5BrowserActions.mjs';
import { setViewport, showUploadState } from './driveV5BrowserVisualActions.mjs';
import { SIMPLE_DRIVE_FIXTURE } from './simpleDriveBrowserFixture.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const evidence = path.resolve(here, '../../../../.ai-thoughts/2026-09-17-1510-drive-reference-reality/screenshots');
fs.mkdirSync(evidence, { recursive: true });
const harness = await createDriveBrowserHarness();
const fixture = (await harness.client.send('Page.addScriptToEvaluateOnNewDocument', { source: SIMPLE_DRIVE_FIXTURE })).identifier;

async function openFresh(width, height = 844) {
	await setViewport(harness.client, width, height);
	await harness.navigate('/apps/drive/');
	await waitForDrive(harness.client);
	const state = await inspectDrive(harness.client);
	assertDriveState(state, width <= 760);
	return state;
}

async function screenshot(name) {
	await harness.screenshot(path.join(evidence, name));
}

try {
	for (const [width, height] of [[320, 844], [390, 844], [430, 932]]) {
		await openFresh(width, height);
		await screenshot(`drive-mobile-home-${width}.png`);
	}
	await openFresh(390);
	await showList(harness.client);
	await screenshot('drive-mobile-list-390.png');
	await openMobileSheet(harness.client);
	await screenshot('drive-mobile-actions-390.png');
	await harness.client.evaluate(`document.querySelector('[data-entry-path="styles.css"] .drive-entry-menu')?.removeAttribute('open')`);
	await provePublicLink(harness.client);
	await proveFolderNavigation(harness.client);

	await openFresh(1366, 900);
	await harness.client.evaluate(`document.querySelector('#view-grid')?.click()`);
	await screenshot('drive-desktop-grid.png');
	await showDesktopDetails(harness.client);
	assertDetails(await inspectDetails(harness.client));
	await screenshot('drive-desktop-details.png');

	await openFresh(390);
	await showUploadState(harness.client);
	await screenshot('drive-upload-state.png');

	await setViewport(harness.client, 390, 900);
	await harness.navigate('/apps/drive/advanced.html');
	await waitForAdvanced(harness.client);
	assertAdvanced(await inspectAdvanced(harness.client));
	await screenshot('drive-advanced-390.png');

	const required = ['drive-mobile-home-320.png','drive-mobile-home-390.png','drive-mobile-home-430.png','drive-mobile-list-390.png','drive-mobile-actions-390.png','drive-desktop-grid.png','drive-desktop-details.png','drive-upload-state.png','drive-advanced-390.png'];
	const names = fs.readdirSync(evidence).filter(name => name.startsWith('drive-') && name.endsWith('.png'));
	for (const name of required) assert(names.includes(name), JSON.stringify(names));
	assert.deepEqual(harness.errors, [], JSON.stringify(harness.errors));
	console.log('B"H canonical Drive browser proof passed', required);
} finally {
	await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: fixture }).catch(() => null);
	await harness.close();
}
