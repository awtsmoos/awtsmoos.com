//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveSelectionBrowserActions
 * @description Drives real touch selection and folder organization through Chrome DevTools input.
 * The Awtsmoos gives one held touch one deliberate meaning; Awtsmoos.com proves that meaning
 * through the browser's own input river before trusting the visible result.
 */
import assert from 'node:assert/strict';
import { waitUntil } from './driveV5BrowserAssertions.mjs';

export async function longPress(client, path, holdMs = 560) {
	await client.send('Network.setCacheDisabled', { cacheDisabled: true }).catch(() => null);
	await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
	await client.evaluate(`document.querySelector('[data-entry-path="${path}"] .drive-entry-open, [data-entry-path="${path}"] .drive-entry-row-open')?.scrollIntoView({ block: 'center' })`);
	await delay(180);
	const point = await client.evaluate(`(() => {
		const root = document.querySelector('[data-entry-path="${path}"]');
		const node = root?.querySelector('.drive-entry-open, .drive-entry-row-open');
		if (!node) return null;
		const rect = node.getBoundingClientRect();
		return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
	})()`);
	assert(point, `Missing tactile entry surface for ${path}`);
	await client.send('Input.dispatchTouchEvent', {
		type: 'touchStart',
		touchPoints: [{ x: point.x, y: point.y, id: 7, radiusX: 2, radiusY: 2, force: 1 }]
	});
	await delay(holdMs);
	await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	await waitUntil(client, `document.body.dataset.driveSelecting === 'active'`, 'Long press did not enter selection mode.');
}

export async function inspectSelection(client) {
	return client.evaluate(`(() => {
		const selected = [...document.querySelectorAll('[data-entry-path][aria-selected="true"]')];
		const dock = document.querySelector('.drive-mobile-dock');
		const bar = document.querySelector('#drive-bulk-bar');
		const sample = selected[0];
		const style = sample ? getComputedStyle(sample) : null;
		return {
			count: Number(document.body.dataset.driveSelectionCount || 0),
			mode: document.body.dataset.driveSelecting || '',
			paths: selected.map(node => node.dataset.entryPath),
			textSelection: String(getSelection()),
			userSelect: style?.userSelect || '',
			webkitUserSelect: style?.webkitUserSelect || '',
			dockDisplay: dock ? getComputedStyle(dock).display : '',
			barVisible: Boolean(bar && !bar.hidden && bar.getClientRects().length),
			overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
		};
	})()`);
}

export async function toggleEntry(client, path) {
	await client.evaluate(`document.querySelector('[data-entry-path="${path}"] .drive-entry-open, [data-entry-path="${path}"] .drive-entry-row-open')?.click()`);
	await waitUntil(client, `Number(document.body.dataset.driveSelectionCount || 0) >= 2`, 'Second entry did not join selection.');
}

export async function openMoveChooser(client) {
	await client.evaluate(`document.querySelector('#drive-bulk-bar [data-bulk-action="move"]')?.click()`);
	await waitUntil(client, `document.querySelector('.drive-bulk-dialog')?.open === true`, 'Move destination chooser did not open.');
}

export async function inspectChooser(client) {
	return client.evaluate(`(() => ({
		mainPath: document.querySelector('#current-path')?.value || '',
		location: document.querySelector('[data-folder-location]')?.textContent || '',
		folders: [...document.querySelectorAll('[data-folder-path]')].map(node => node.dataset.folderPath),
		upDisabled: Boolean(document.querySelector('[data-folder-up]')?.disabled),
		overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
	}))()`);
}

export async function enterChooserFolder(client, path) {
	await client.evaluate(`document.querySelector('[data-folder-path="${path}"]')?.click()`);
	await waitUntil(client, `document.querySelector('[data-folder-location]')?.textContent.includes('${path}')`, `Chooser did not enter ${path}.`);
}

export async function createChooserFolder(client, name) {
	await client.evaluate(`(() => {
		const input = document.querySelector('[data-folder-name]');
		input.value = ${JSON.stringify(name)};
		input.dispatchEvent(new Event('input', { bubbles: true }));
		document.querySelector('[data-folder-create]')?.click();
	})()`);
	await waitUntil(client, `document.querySelector('[data-folder-location]')?.textContent.includes('${name}')`, `Chooser did not create ${name}.`);
}

export async function commitMove(client) {
	await client.evaluate(`document.querySelector('[data-folder-submit]')?.click()`);
	await waitUntil(client, `document.body.dataset.driveSelecting === 'idle'`, 'Bulk move did not reconcile selection.');
}

export async function promoteDesktopSelection(client, path) {
	await client.evaluate(`document.querySelector('[data-entry-path="${path}"] .drive-entry-open')?.click()`);
	await waitUntil(client, `document.querySelector('#drive-details') && !document.querySelector('#drive-details').hidden`, 'Desktop Details did not open.');
	await client.evaluate(`document.querySelector('[data-entry-path="${path}"] .drive-entry-open')?.dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }))`);
	await waitUntil(client, `document.body.dataset.driveSelecting === 'active'`, 'Ctrl-click did not promote Details selection into bulk mode.');
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
