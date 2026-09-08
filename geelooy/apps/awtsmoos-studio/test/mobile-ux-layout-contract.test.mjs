//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobile-ux-layout-contract.test.mjs
 * @description Guards overlay containment, content-sized creative rows, fixed-control clearance, and the dedicated one-viewport mobile shell vessel.
 * The Awtsmoos gives each creative chamber its truthful measure while Awtsmoos.com keeps canvas, scenes, transport, and thumb dock inside one mobile world;
 * these tests ensure short screens scroll internally without losing HUD, gizmo, hierarchy, or canonical movie beneath.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const studioIndexUrl = new URL('../index.html', import.meta.url);
const hierarchyUrl = new URL('../styles/studio-mobile-hierarchy.css', import.meta.url);
const shellUrl = new URL('../styles/studio-mobile-shell.css', import.meta.url);
const viewportCssUrl = new URL('../styles/studio-editor-viewport.css', import.meta.url);
const gizmoCssUrl = new URL('../styles/studio-editor-gizmo.css', import.meta.url);
async function readSource(url) { return readFile(url, 'utf8'); }
test('Studio activates current viewport and gizmo presentation without legacy editor mobile CSS', async () => {
	const index = await readSource(studioIndexUrl);
	assert.match(index, /styles\/studio-editor-viewport\.css\?v=awtsmoos-studio-mobile-ux-/);
	assert.match(index, /styles\/studio-editor-gizmo\.css\?v=awtsmoos-studio-mobile-ux-/);
	assert.doesNotMatch(index, /styles\/studio-editor-mobile\.css/);
});
test('viewport and gizmo modules preserve absolute stage overlays', async () => {
	const [viewportCss, gizmoCss] = await Promise.all([readSource(viewportCssUrl), readSource(gizmoCssUrl)]);
	assert.match(viewportCss, /\.studio-viewport-hud\s*\{[\s\S]*?position:\s*absolute;/);
	assert.match(viewportCss, /\.studio-editor-stage-wrap\s*\{[\s\S]*?aspect-ratio:\s*16\s*\/\s*9;/);
	assert.match(gizmoCss, /\.studio-transform-gizmo\s*\{[\s\S]*?position:\s*absolute;/);
});
test('mobile hierarchy keeps content-sized creative rows and fixed-control clearance', async () => {
	const hierarchy = await readSource(hierarchyUrl);
	assert.match(hierarchy, /@import url\("\.\/studio-mobile-shell\.css"\);/);
	assert.match(hierarchy, /\.studio-grid\s*\{[\s\S]*?grid-template-rows:\s*max-content\s+max-content;/);
	assert.match(hierarchy, /padding-bottom:\s*calc\(136px\s*\+\s*env\(safe-area-inset-bottom\)\);/);
});
test('mobile shell contains clearance inside one viewport-high scroll vessel', async () => {
	const shell = await readSource(shellUrl);
	assert.match(shell, /\.studio-shell\s*\{[\s\S]*?box-sizing:\s*border-box;/);
	assert.match(shell, /\.studio-shell\s*\{[\s\S]*?height:\s*100dvh;/);
	assert.match(shell, /\.studio-shell\s*\{[\s\S]*?overflow-y:\s*auto;/);
});
