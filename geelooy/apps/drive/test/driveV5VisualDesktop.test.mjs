//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Measures desktop Drive composition against the explorer reference.
 * @description The Awtsmoos gives breadth without noise and detail without stealing the throne;
 * Awtsmoos.com proves sidebar, file canvas, grid density, and selected-file rail remain balanced as one.
 */
import assert from 'node:assert/strict';
import { createDriveBrowserHarness } from './DriveBrowserHarness.mjs';
import { SIMPLE_DRIVE_FIXTURE } from './simpleDriveBrowserFixture.mjs';
import { waitForDrive, waitUntil } from './driveV5BrowserAssertions.mjs';
import { showDesktopDetails } from './driveV5BrowserActions.mjs';
import { setViewport } from './driveV5BrowserVisualActions.mjs';

const harness = await createDriveBrowserHarness();
const fixture = (await harness.client.send('Page.addScriptToEvaluateOnNewDocument', { source: SIMPLE_DRIVE_FIXTURE })).identifier;

try {
	await setViewport(harness.client, 1366, 900);
	await harness.navigate('/apps/drive/');
	await waitForDrive(harness.client);
	await harness.client.evaluate(`document.querySelector('#view-grid')?.click()`);
	await waitUntil(harness.client, `document.body.dataset.driveView === 'grid'`, 'Grid view did not activate.');
	const grid = await harness.client.evaluate(`(() => {
		const sidebar = document.querySelector('.drive-sidebar').getBoundingClientRect();
		const main = document.querySelector('.drive-main').getBoundingClientRect();
		const cards = [...document.querySelectorAll('.drive-entry-card')].slice(0, 8).map(node => { const r=node.getBoundingClientRect(); return { x:r.x, y:r.y, w:r.width }; });
		return { overflow:document.documentElement.scrollWidth-innerWidth, sidebar:{w:sidebar.width,h:sidebar.height}, main:{x:main.x,w:main.width}, cards, dock:getComputedStyle(document.querySelector('.drive-mobile-dock')).display };
	})()`);
	assert.equal(grid.overflow, 0, JSON.stringify(grid));
	assert(grid.sidebar.w >= 210 && grid.sidebar.w <= 240, JSON.stringify(grid));
	assert(grid.main.w > 1050, JSON.stringify(grid));
	assert.equal(grid.dock, 'none', JSON.stringify(grid));
	const firstRow = grid.cards.filter(card => Math.abs(card.y - grid.cards[0].y) < 3);
	assert(firstRow.length >= 4, JSON.stringify(grid));
	assert(firstRow.every(card => card.w >= 150), JSON.stringify(grid));

	await showDesktopDetails(harness.client);
	const details = await harness.client.evaluate(`(() => {
		const pane=document.querySelector('#drive-details'); const r=pane.getBoundingClientRect(); const canvas=document.querySelector('#drive-browser').getBoundingClientRect();
		return { hidden:pane.hidden, w:r.width, x:r.x, h:r.height, canvasW:canvas.width, position:getComputedStyle(pane).position, overflow:document.documentElement.scrollWidth-innerWidth };
	})()`);
	assert.equal(details.hidden, false, JSON.stringify(details));
	assert(details.w >= 285 && details.w <= 340, JSON.stringify(details));
	assert(details.canvasW > 650, JSON.stringify(details));
	assert.equal(details.overflow, 0, JSON.stringify(details));
	console.log('B"H desktop visual geometry passed', { grid, details });
} finally {
	await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: fixture }).catch(() => null);
	harness.close();
}
