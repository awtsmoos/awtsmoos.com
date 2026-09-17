//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveV5BrowserActions
 * @description Exercises intentional file interactions through the real Drive DOM.
 * The Awtsmoos lets one action reveal another state without dividing the underlying world;
 * Awtsmoos.com proves navigation, disclosure, sharing, and details from one file truth unfurled.
 */
import assert from 'node:assert/strict';
import { waitForDrive, waitUntil } from './driveV5BrowserAssertions.mjs';

export async function showList(client) {
	await client.evaluate(`document.querySelector('#view-list')?.click()`);
	await waitUntil(client, `document.body.dataset.driveView === 'list' && document.querySelector('.drive-entry-list')`, 'List view did not appear.');
}

export async function openMobileSheet(client, path = 'styles.css') {
	await client.evaluate(`document.querySelector('[data-entry-path="${path}"] .drive-entry-menu > summary')?.click()`);
	await waitUntil(client, `document.querySelector('[data-entry-path="${path}"] .drive-entry-menu')?.open === true`, 'Mobile More did not open.');
	const state = await client.evaluate(`(() => {
		const menu = document.querySelector('[data-entry-path="${path}"] .drive-entry-menu-popover');
		const details = document.querySelector('#drive-details');
		return {
			position: menu ? getComputedStyle(menu).position : '',
			detailsVisible: Boolean(details && !details.hidden && details.getClientRects().length)
		};
	})()`);
	assert.equal(state.position, 'fixed', JSON.stringify(state));
	assert.equal(state.detailsVisible, false, JSON.stringify(state));
}

export async function provePublicLink(client, path = 'styles.css') {
	await client.evaluate(`window.__copiedDriveLink = ''; navigator.clipboard.writeText = async value => { window.__copiedDriveLink = value; };`);
	await clickEntryAction(client, path, 'public');
	await waitUntil(client, `document.querySelector('[data-toast-title]')?.textContent === 'File is public'`, 'Public promotion toast did not appear.');
	await clickEntryAction(client, path, 'link');
	await waitUntil(client, `window.__copiedDriveLink && document.querySelector('[data-toast-title]')?.textContent === 'Public link copied'`, 'Public link copy did not complete.');
	const copied = await client.evaluate(`window.__copiedDriveLink`);
	assert.match(copied, new RegExp(path.replace('.', '\\.')));
}

export async function proveFolderNavigation(client, path = 'Projects') {
	await client.evaluate(`(() => {
		const entry = document.querySelector('[data-entry-path="${path}"]');
		entry?.querySelector('.drive-entry-open, .drive-entry-row-open')?.click();
	})()`);
	await waitUntil(client, `document.querySelector('#current-path')?.value === '${path}'`, 'Folder path did not update.');
	await waitForDrive(client, 2);
	const testimony = await client.evaluate(`({
		location: document.querySelector('#drive-location')?.textContent || '',
		paths: [...document.querySelectorAll('[data-entry-path]')].map(node => node.dataset.entryPath)
	})`);
	assert.equal(testimony.location, path, JSON.stringify(testimony));
	assert(testimony.paths.every(value => value.startsWith(`${path}/`)), JSON.stringify(testimony));
	await client.evaluate(`document.querySelector('[data-drive-nav="files"]')?.click()`);
	await waitUntil(client, `document.querySelector('#current-path')?.value === ''`, 'Files navigation did not return to root.');
	await waitForDrive(client);
}

export async function showDesktopDetails(client, path = 'index.html') {
	await client.evaluate(`document.querySelector('#view-grid')?.click()`);
	await waitUntil(client, `document.body.dataset.driveView === 'grid'`, 'Grid view did not activate.');
	await client.evaluate(`document.querySelector('[data-entry-path="${path}"] .drive-entry-open')?.click()`);
	await waitUntil(client, `document.querySelector('#drive-details') && !document.querySelector('#drive-details').hidden`, 'Desktop details did not appear.');
}

async function clickEntryAction(client, path, action) {
	await client.evaluate(`document.querySelector('[data-entry-path="${path}"] .drive-entry-menu > summary')?.click()`);
	await waitUntil(client, `document.querySelector('[data-entry-path="${path}"] .drive-entry-menu')?.open === true`, `More did not open for ${path}.`);
	await client.evaluate(`document.querySelector('[data-entry-path="${path}"] [data-entry-action="${action}"]')?.click()`);
}
