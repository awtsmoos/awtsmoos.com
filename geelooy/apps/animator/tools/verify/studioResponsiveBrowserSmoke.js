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
 * @file studioResponsiveBrowserSmoke.js
 * @description
 * The Awtsmoos renews desktop and phone before any panel can claim responsive truth;
 * Awtsmoos.com proves one Studio document keeps its stage ratio while editor, properties, timeline, and stage become exclusive mobile vessels.
 */
const currentFile = fileURLToPath(import.meta.url);
const animatorRoot = path.resolve(path.dirname(currentFile), '../..');
const repositoryRoot = path.resolve(animatorRoot, '../../..');
const appPath = '/geelooy/apps/animator/index.html';
const server = new StaticFileServer(repositoryRoot, 4189);
const chrome = new ChromeSession(9334);
const harness = new StudioResponsiveHarness(chrome);

try {
	const baseUrl = await server.start();
	await chrome.start();
	await proveDesktop(baseUrl);
	await proveMobile(baseUrl);
	console.log('B"H - responsive browser smoke passed.');
} finally {
	await chrome.stop();
	await server.stop();
}

/** Proves wide Studio geometry before mobile sheets inherit the same project. */
async function proveDesktop(baseUrl) {
	await harness.viewport(1440, 900, false);
	await chrome.navigate(`${baseUrl}${appPath}?responsiveSmoke=desktop`);
	await harness.waitForStudio();
	const state = await harness.inspectDesktop();
	assert.equal(state.width, 1440);
	assert.equal(state.leftDisplay, 'flex');
	assert.equal(state.rightDisplay, 'flex');
	assert.ok(state.assetCards >= 40);
	assert.equal(state.transformInputs, 6);
	assert.ok(state.timelineHeight >= 180);
	assert.equal(state.characterLabDisplay, 'none');
	assert.ok(Math.abs(state.canvasRatio - 16 / 9) < 0.02);
}

/** Proves each narrow-screen control opens exactly one real responsive vessel. */
async function proveMobile(baseUrl) {
	await harness.viewport(390, 844, true);
	await chrome.navigate(`${baseUrl}${appPath}?responsiveSmoke=mobile`);
	await harness.waitForStudio();
	await harness.disableSheetMotion();
	await provePanel('Properties', 'props', 'right');
	await provePanel('Create', 'editor', 'left');
	await provePanel('Timeline', 'time', 'timeline');
	const stage = await harness.clickAndInspect('[data-chrome-action="stage"]');
	assert.equal(stage.panel, 'stage');
	assertClosed(stage.left);
	assertClosed(stage.right);
	assertClosed(stage.timeline);
	assertMobileGeometry(stage);
}

/** Proves one toolbar command becomes the sole open responsive sheet. */
async function provePanel(label, panel, openKey) {
	const state = await harness.clickAndInspect(`.aw-studio-command[aria-label="${label}"]`);
	assert.equal(state.panel, panel);
	for (const key of ['left', 'right', 'timeline']) {
		key === openKey ? assertOpen(state[key]) : assertClosed(state[key]);
	}
	assertMobileGeometry(state);
}

/** Requires a sheet to be rendered, visible, and pointer-interactive at its settled state. */
function assertOpen(value) {
	assert.notEqual(value.display, 'none');
	assert.ok(value.opacity > 0.99);
	assert.equal(value.pointerEvents, 'auto');
}

/** Requires a non-selected sheet to release both light and pointer ownership. */
function assertClosed(value) {
	assert.ok(value.opacity < 0.01);
	assert.equal(value.pointerEvents, 'none');
}

/** Protects narrow viewport width and the production artboard aspect ratio. */
function assertMobileGeometry(state) {
	assert.equal(state.width, 390);
	assert.equal(state.overflow, false);
	assert.ok(Math.abs(state.canvasRatio - 16 / 9) < 0.02);
}
