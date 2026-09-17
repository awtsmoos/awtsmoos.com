//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Measures mobile Drive composition against the reference constitution.
 * @description The Awtsmoos fits a whole file world into the palm without crushing its grace;
 * Awtsmoos.com proves search, actions, folders, sheet, dock, and upload occupy their rightful place.
 */
import assert from 'node:assert/strict';
import { createDriveBrowserHarness } from './DriveBrowserHarness.mjs';
import { SIMPLE_DRIVE_FIXTURE } from './simpleDriveBrowserFixture.mjs';
import { waitForDrive } from './driveV5BrowserAssertions.mjs';
import { openMobileSheet, showList } from './driveV5BrowserActions.mjs';
import { setViewport, showUploadState } from './driveV5BrowserVisualActions.mjs';

const harness = await createDriveBrowserHarness();
const fixture = (await harness.client.send('Page.addScriptToEvaluateOnNewDocument', { source: SIMPLE_DRIVE_FIXTURE })).identifier;

try {
	await setViewport(harness.client, 390, 844);
	await harness.navigate('/apps/drive/');
	await waitForDrive(harness.client);
	const home = await harness.client.evaluate(`(() => {
		const box = node => { const r = node.getBoundingClientRect(); return { x:r.x, y:r.y, w:r.width, h:r.height, b:r.bottom }; };
		const styled = node => ({ ...box(node), position:getComputedStyle(node).position, bg:getComputedStyle(node).backgroundColor });
		return {
			overflow: document.documentElement.scrollWidth - innerWidth,
			account: box(document.querySelector('#drive-alias-chip')),
			search: box(document.querySelector('.drive-search-field')),
			upload: styled(document.querySelector('#choose-files')),
			folders: [...document.querySelectorAll('.drive-home-folders .drive-entry-card')].slice(0, 4).map(box),
			recentY: document.querySelector('.drive-home-recent')?.getBoundingClientRect().y,
			dock: styled(document.querySelector('.drive-mobile-dock'))
		};
	})()`);
	assert.equal(home.overflow, 0, JSON.stringify(home));
	assert(home.account.w < 130 && home.account.h <= 50, JSON.stringify(home));
	assert(home.search.y < 120 && home.search.h >= 46, JSON.stringify(home));
	assert(home.upload.bg !== 'rgba(0, 0, 0, 0)', JSON.stringify(home));
	assert(home.folders.length >= 4, JSON.stringify(home));
	assert(Math.abs(home.folders[0].y - home.folders[1].y) < 4, JSON.stringify(home));
	assert(home.folders[2].y > home.folders[0].y, JSON.stringify(home));
	assert(home.dock.position === 'fixed' && Math.abs(home.dock.b - 844) < 2, JSON.stringify(home));
	assert(home.recentY > home.folders[2].y, JSON.stringify(home));

	await showList(harness.client);
	const list = await harness.client.evaluate(`(() => {
		const row = document.querySelector('.drive-entry-row').getBoundingClientRect();
		return { overflow:document.documentElement.scrollWidth-innerWidth, w:row.width, h:row.height, modified:getComputedStyle(document.querySelector('.drive-entry-row-modified')).display, size:getComputedStyle(document.querySelector('.drive-entry-row-size')).display };
	})()`);
	assert.equal(list.overflow, 0, JSON.stringify(list));
	assert.equal(list.modified, 'none', JSON.stringify(list));
	assert.equal(list.size, 'none', JSON.stringify(list));
	assert(list.h >= 56 && list.w <= 362, JSON.stringify(list));

	await openMobileSheet(harness.client, 'styles.css');
	const sheet = await harness.client.evaluate(`(() => {
		const node = document.querySelector('[data-entry-path="styles.css"] .drive-entry-menu-popover');
		const r = node.getBoundingClientRect(); const dock = document.querySelector('.drive-mobile-dock').getBoundingClientRect();
		const danger = [...node.querySelectorAll('button')].find(button => button.classList.contains('is-danger'));
		return { x:r.x, y:r.y, w:r.width, h:r.height, b:r.bottom, position:getComputedStyle(node).position, dockY:dock.y, danger:danger ? getComputedStyle(danger).color : '', summary:getComputedStyle(node.querySelector('.drive-entry-menu-summary')).display };
	})()`);
	assert(sheet.position === 'fixed' && sheet.x <= 12 && sheet.w >= 360, JSON.stringify(sheet));
	assert(sheet.b <= sheet.dockY + 2 && sheet.summary !== 'none' && sheet.danger, JSON.stringify(sheet));

	await harness.navigate('/apps/drive/');
	await waitForDrive(harness.client);
	await showUploadState(harness.client);
	const upload = await harness.client.evaluate(`(() => {
		const row = document.querySelector('.drive-upload-row'); const r = row.getBoundingClientRect(); const progress = row.querySelector('progress');
		return { y:r.y, h:r.height, text:row.textContent, value:progress.value, browserY:document.querySelector('#drive-browser').getBoundingClientRect().y };
	})()`);
	assert(upload.text.includes('lake.jpg') && upload.text.includes('68%'), JSON.stringify(upload));
	assert.equal(upload.value, 68, JSON.stringify(upload));
	assert(upload.y >= upload.browserY && upload.h < 90, JSON.stringify(upload));
	console.log('B"H mobile visual geometry passed', { home, list, sheet, upload });
} finally {
	await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: fixture }).catch(() => null);
	harness.close();
}
