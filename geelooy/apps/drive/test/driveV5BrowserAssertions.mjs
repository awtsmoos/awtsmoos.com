//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveV5BrowserAssertions
 * @description Measures the real files-first `/apps/drive/` DOM across responsive states.
 * The Awtsmoos reveals one file world through many widths without dividing its truth;
 * Awtsmoos.com proves identity, files, actions, density, and overflow from root to fruit.
 */
import assert from 'node:assert/strict';

export async function waitForDrive(client, minimumEntries = 10) {
	for (let attempt = 0; attempt < 80; attempt += 1) {
		const ready = await client.evaluate(`document.body?.dataset.driveAlias === 'teacher' && document.querySelectorAll('[data-entry-path]').length >= ${minimumEntries}`);
		if (ready) return;
		await delay(125);
	}
	throw new Error('Drive did not reveal the signed-in file world.');
}

export async function inspectDrive(client) {
	return client.evaluate(`(() => {
		const visible = selector => {
			const node = document.querySelector(selector);
			if (!node) return false;
			const style = getComputedStyle(node);
			return !node.hidden && style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0;
		};
		return {
			path: location.pathname,
			alias: document.body.dataset.driveAlias || '',
			entries: document.querySelectorAll('[data-entry-path]').length,
			folders: document.querySelectorAll('[data-entry-type="folder"]').length,
			files: document.querySelectorAll('[data-entry-type="file"]').length,
			homeFolders: document.querySelectorAll('.drive-folder-rail [data-entry-type="folder"]').length,
			homeFiles: document.querySelectorAll('.drive-home-files [data-entry-type="file"]').length,
			upload: visible('#choose-files'),
			newFolder: visible('#new-folder'),
			search: visible('#search'),
			sidebar: visible('.drive-sidebar'),
			mobileDock: visible('.drive-mobile-dock'),
			overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
			legacy: /Website Maker|Mission Control|Project Platform|Enter an alias|Builder/.test(document.body.innerText),
			requests: window.__driveFixtureRequests?.length || 0
		};
	})()`);
}

export function assertDriveState(state, compact) {
	assert.equal(state.path, '/apps/drive/', JSON.stringify(state));
	assert.equal(state.alias, 'teacher', JSON.stringify(state));
	assert(state.entries >= 10, JSON.stringify(state));
	assert(state.folders >= 5 && state.files >= 6, JSON.stringify(state));
	assert(state.homeFolders >= 5 && state.homeFiles >= 4, JSON.stringify(state));
	assert(state.upload && state.newFolder && state.search, JSON.stringify(state));
	assert.equal(state.overflow, 0, JSON.stringify(state));
	assert.equal(state.legacy, false, JSON.stringify(state));
	assert(state.requests >= 3, JSON.stringify(state));
	assert.equal(state.mobileDock, compact, JSON.stringify(state));
	assert.equal(state.sidebar, !compact, JSON.stringify(state));
}

export async function inspectDetails(client) {
	return client.evaluate(`(() => {
		const pane = document.querySelector('#drive-details');
		return {
			visible: Boolean(pane && !pane.hidden && pane.getClientRects().length),
			name: document.querySelector('.drive-details-hero h2')?.textContent || '',
			publicUrl: document.querySelector('.drive-details-public code')?.textContent || '',
			actions: [...document.querySelectorAll('[data-details-action]')].map(node => node.dataset.detailsAction)
		};
	})()`);
}

export function assertDetails(details, name = 'index.html') {
	assert.equal(details.visible, true, JSON.stringify(details));
	assert.equal(details.name, name, JSON.stringify(details));
	assert.match(details.publicUrl, /index\.html/, JSON.stringify(details));
	for (const action of ['open', 'link', 'rename', 'move', 'copy', 'trash']) {
		assert(details.actions.includes(action), JSON.stringify(details));
	}
}

export async function waitUntil(client, expression, message) {
	for (let attempt = 0; attempt < 50; attempt += 1) {
		if (await client.evaluate(expression)) return;
		await delay(100);
	}
	throw new Error(message);
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
