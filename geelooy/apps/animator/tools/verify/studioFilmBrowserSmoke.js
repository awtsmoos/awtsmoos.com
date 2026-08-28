// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ChromeSession } from '../render/headless/ChromeSession.js';
import { StaticFileServer } from '../render/headless/StaticFileServer.js';
import { StudioResponsiveHarness } from './StudioResponsiveHarness.js';

/**
 * @file studioFilmBrowserSmoke.js
 * @description
 * The Awtsmoos renews Film on desktop and phone before seven tabs, folded coverage, or a planned shot may claim responsive truth;
 * Awtsmoos.com proves the real Studio event path keeps cinematic depth retractable, focus-visible, locally scrollable, and inside the viewport booth.
 */
const currentFile = fileURLToPath(import.meta.url);
const animatorRoot = path.resolve(path.dirname(currentFile), '../..');
const repositoryRoot = path.resolve(animatorRoot, '../../..');
const appPath = '/geelooy/apps/animator/index.html';
const server = new StaticFileServer(repositoryRoot, 4192);
const chrome = new ChromeSession(9337);
const responsive = new StudioResponsiveHarness(chrome);

try {
	const baseUrl = await server.start();
	await chrome.start();
	await proveDesktop(baseUrl);
	await proveMobile(baseUrl);
	console.log('B"H - Film browser smoke passed.');
} finally {
	await chrome.stop();
	await server.stop();
}

/** @param {string} baseUrl Static app origin. @returns {Promise<void>} Desktop Film proof. */
async function proveDesktop(baseUrl) {
	await responsive.viewport(1440, 900, false);
	await chrome.navigate(`${baseUrl}${appPath}?filmSmoke=desktop`);
	await responsive.waitForStudio();
	const before = await openFilm();
	assert.equal(before.tabCount, 7);
	assert.equal(before.filmVisible, true);
	assert.equal(before.openDetails, 0);
	const planned = await planCoverage();
	assert.equal(planned.cards, 6);
	assert.equal(planned.openDetails, 0);
	assert.match(planned.plannedLabel, /Planned coverage · 6/);
}

/** @param {string} baseUrl Static app origin. @returns {Promise<void>} Phone Film proof. */
async function proveMobile(baseUrl) {
	await responsive.viewport(390, 844, true);
	await chrome.navigate(`${baseUrl}${appPath}?filmSmoke=mobile`);
	await responsive.waitForStudio();
	await responsive.disableSheetMotion();
	await responsive.clickAndInspect('.aw-studio-command[aria-label="Create"]');
	await openFilm();
	const state = await chrome.client.evaluate(`(() => {
		const tabs = document.querySelector('.aw-studio-left-panel > .aw-studio-tabs');
		const filmTab = document.querySelector('.aw-studio-left-panel [data-panel="film"]');
		filmTab?.focus();
		const focus = filmTab ? getComputedStyle(filmTab) : null;
		const left = document.querySelector('.app-sidebar-left')?.getBoundingClientRect();
		return {
			pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
			tabOwnsScroll: Boolean(tabs && tabs.scrollWidth >= tabs.clientWidth),
			outlineWidth: focus?.outlineWidth || '0px',
			leftWidth: left?.width || 0,
			viewportWidth: innerWidth,
			openDetails: [...document.querySelectorAll('.aw-studio-film-details')].filter((item) => item.open).length
		};
	})()`);
	assert.equal(state.pageOverflow, false);
	assert.equal(state.tabOwnsScroll, true);
	assert.notEqual(state.outlineWidth, '0px');
	assert.ok(state.leftWidth <= state.viewportWidth);
	assert.equal(state.openDetails, 0);
}

/** @returns {Promise<object>} Opens Film through the real Studio tab event. */
async function openFilm() {
	const state = await chrome.client.evaluate(`(() => {
		document.querySelector('.aw-studio-left-panel [data-panel="film"]')?.click();
		return true;
	})()`);
	assert.equal(state, true);
	await new Promise((resolve) => setTimeout(resolve, 100));
	return chrome.client.evaluate(`(() => ({
		tabCount: document.querySelectorAll('.aw-studio-left-panel > .aw-studio-tabs [data-panel]').length,
		filmVisible: Boolean(document.querySelector('.aw-studio-film')),
		openDetails: [...document.querySelectorAll('.aw-studio-film-details')].filter((item) => item.open).length
	}))()`);
}

/** @returns {Promise<object>} Plans Film coverage through the visible primary action. */
async function planCoverage() {
	await chrome.client.evaluate(`document.querySelector('.aw-studio-film-plan')?.click()`);
	await new Promise((resolve) => setTimeout(resolve, 100));
	return chrome.client.evaluate(`(() => {
		const details = [...document.querySelectorAll('.aw-studio-film-details')];
		const planned = details.find((item) => item.querySelector('summary')?.textContent.startsWith('Planned coverage'));
		return {
			cards: planned?.querySelectorAll('.aw-studio-film-shot').length || 0,
			plannedLabel: planned?.querySelector('summary')?.textContent || '',
			openDetails: details.filter((item) => item.open).length
		};
	})()`);
}
