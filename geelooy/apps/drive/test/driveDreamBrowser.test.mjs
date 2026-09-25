//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Proves the dream Drive presentation in the living fixture-backed browser.
 * @description The Awtsmoos lets beauty and truth occupy one mobile vessel; Awtsmoos.com
 * proves hero, categories, privacy testimony, upload bytes, transfer hierarchy, and desktop continuity.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDriveBrowserHarness } from './DriveBrowserHarness.mjs';
import { waitForDrive, waitUntil } from './driveV5BrowserAssertions.mjs';
import { setViewport, showUploadState } from './driveV5BrowserVisualActions.mjs';
import { SIMPLE_DRIVE_FIXTURE } from './simpleDriveBrowserFixture.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const evidence = path.resolve(here, '../../../../.ai-thoughts/2026-09-18-0314-drive-dream-realization/screenshots');
fs.mkdirSync(evidence, { recursive: true });
const origin = process.env.AWTSMOOS_DRIVE_TEST_ORIGIN || 'http://127.0.0.1:18080';
const harness = await createDriveBrowserHarness({ origin });
const fixture = (await harness.client.send('Page.addScriptToEvaluateOnNewDocument', { source: SIMPLE_DRIVE_FIXTURE })).identifier;

async function screenshot(name) {
	await harness.screenshot(path.join(evidence, name));
}

async function inspect() {
	return harness.client.evaluate(`(() => ({
		brand: document.querySelector('.drive-mobile-brand .drive-brand-title')?.textContent.trim() || '',
		subtitle: document.querySelector('.drive-mobile-brand small')?.textContent.trim() || '',
		categories: [...document.querySelectorAll('.drive-category-bar button[data-drive-category]')].map(node => node.textContent.trim()),
		publicLabels: [...document.querySelectorAll('[data-drive-nav="shared"]')].map(node => node.textContent.trim()),
		folders: document.querySelectorAll('.drive-folder-card').length,
		files: document.querySelectorAll('.drive-media-card').length,
		badges: [...document.querySelectorAll('.drive-visibility-badge')].map(node => node.textContent.trim()),
		overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
	}))()`);
}

try {
	await harness.client.send('Network.setCacheDisabled', { cacheDisabled: true }).catch(() => null);
	await setViewport(harness.client, 390, 844);
	await harness.navigate('/apps/drive/?dream=1');
	await waitForDrive(harness.client);
	let state = await inspect();
	assert.match(state.brand, /Awtsmoos Drive/);
	assert.match(state.subtitle, /Your files\. A bigger world/);
	assert.deepEqual(state.categories, ['▦ All', '📁 Folders', '▧ Images', '▷ Videos', '▤ Docs']);
	assert(state.publicLabels.every(label => label.includes('Public')), JSON.stringify(state));
	assert(state.folders > 0, JSON.stringify(state));
	assert(state.files > 0, JSON.stringify(state));
	assert(state.badges.some(label => /Public|Private/.test(label)), JSON.stringify(state));
	assert.equal(state.overflow, 0, JSON.stringify(state));
	await screenshot('dream-mobile-home-390.png');

	await harness.client.evaluate(`document.querySelector('[data-drive-category="folders"]')?.click()`);
	await waitUntil(harness.client, `document.body.dataset.driveCategory === 'folders'`, 'Folders category did not activate.');
	const folderOnly = await harness.client.evaluate(`({
		count: document.querySelectorAll('[data-entry-type="folder"]').length,
		files: document.querySelectorAll('[data-entry-type="file"]').length,
		overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
	})`);
	assert(folderOnly.count > 0, JSON.stringify(folderOnly));
	assert.equal(folderOnly.files, 0, JSON.stringify(folderOnly));
	assert.equal(folderOnly.overflow, 0, JSON.stringify(folderOnly));
	await screenshot('dream-mobile-folders-390.png');

	await harness.client.evaluate(`document.querySelector('[data-drive-category="all"]')?.click()`);
	await showUploadState(harness.client);
	await waitUntil(harness.client, `Boolean(document.querySelector('.drive-upload-summary'))`, 'Upload summary did not render.');
	const upload = await harness.client.evaluate(`({
		percent: Number(document.querySelector('.drive-upload-summary')?.dataset.uploadPercent || -1),
		text: document.querySelector('.drive-upload-summary')?.textContent || ''
	})`);
	assert(upload.percent >= 0 && upload.percent <= 100, JSON.stringify(upload));
	assert.match(upload.text, /%/);
	await screenshot('dream-upload-summary-390.png');

	await setViewport(harness.client, 1366, 900);
	await harness.navigate('/apps/drive/?dream_desktop=1');
	await waitForDrive(harness.client);
	state = await inspect();
	assert.equal(state.overflow, 0, JSON.stringify(state));
	assert.equal(await harness.client.evaluate(`getComputedStyle(document.querySelector('.drive-sidebar')).display === 'none'`), false);
	await screenshot('dream-desktop-home.png');
	assert.deepEqual(harness.errors, [], JSON.stringify(harness.errors));
	console.log('B"H dream Drive browser proof passed');
} finally {
	await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: fixture }).catch(() => null);
	await harness.close();
}
