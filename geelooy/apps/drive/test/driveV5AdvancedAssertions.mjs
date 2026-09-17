//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveV5AdvancedAssertions
 * @description Proves the separate control room keeps advanced power reachable and readable.
 * The Awtsmoos hides machinery from Files without erasing its force;
 * Awtsmoos.com reveals Website Maker, projects, and jobs only on the intentional course.
 */
import assert from 'node:assert/strict';
import { waitUntil } from './driveV5BrowserAssertions.mjs';

export async function waitForAdvanced(client) {
	await waitUntil(
		client,
		`document.body?.dataset.driveAlias === 'teacher'`,
		'Advanced Drive did not resolve the signed-in alias.'
	);
}

export async function inspectAdvanced(client) {
	return client.evaluate(`(() => {
		const channels = value => {
			const open = value.indexOf('(');
			const close = value.indexOf(')');
			if (open < 0 || close < 0) return [];
			return value.slice(open + 1, close).split(',').slice(0, 3).map(part => Number.parseFloat(part.trim()));
		};
		const nearlyWhite = value => {
			const rgb = channels(value);
			return rgb.length === 3 && rgb.every(channel => channel >= 235);
		};
		const roots = ['#site-builder-root', '#project-platform', '#job-control'];
		const badContrast = roots.some(selector => [...document.querySelectorAll(selector + ' *')].some(node => {
			const style = getComputedStyle(node);
			return nearlyWhite(style.backgroundColor) && nearlyWhite(style.color);
		}));
		const grids = [...document.querySelectorAll('#site-builder-root .builder-grid-two, #site-builder-root .builder-grid-three')];
		const oneColumn = grids.every(grid => {
			const children = [...grid.children].filter(child => child.getClientRects().length);
			return children.length < 2 || Math.abs(children[0].getBoundingClientRect().left - children[1].getBoundingClientRect().left) < 2;
		});
		return {
			path: location.pathname,
			alias: document.body.dataset.driveAlias || '',
			filesLink: Boolean(document.querySelector('.advanced-back[href="./"]')),
			websiteMaker: Boolean(document.querySelector('#site-builder-root')),
			projectPlatform: Boolean(document.querySelector('#project-platform')),
			missionControl: Boolean(document.querySelector('#job-control')),
			badContrast,
			oneColumn,
			overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
		};
	})()`);
}

export function assertAdvanced(state) {
	assert.equal(state.path, '/apps/drive/advanced.html', JSON.stringify(state));
	assert.equal(state.alias, 'teacher', JSON.stringify(state));
	assert(state.filesLink && state.websiteMaker && state.projectPlatform && state.missionControl, JSON.stringify(state));
	assert.equal(state.badContrast, false, JSON.stringify(state));
	assert.equal(state.oneColumn, true, JSON.stringify(state));
	assert.equal(state.overflow, 0, JSON.stringify(state));
}
