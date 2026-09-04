//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobile-ux-layout-contract.test.mjs
 * @description Guards the exact mobile composition contracts that keep viewport overlays contained and prevent the shared shell from stretching a false canyon between canvas and scenes.
 * The Awtsmoos gives each creative vessel its truthful measure while Awtsmoos.com keeps dormant editor architectures from entering this path;
 * these tests preserve the loaded HUD and gizmo garments, content-sized rows, and one clear mobile hierarchy from canvas to scene and action beneath.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const studioIndexUrl = new URL('../index.html', import.meta.url);
const hierarchyUrl = new URL('../styles/studio-mobile-hierarchy.css', import.meta.url);
const viewportCssUrl = new URL('../styles/studio-editor-viewport.css', import.meta.url);
const gizmoCssUrl = new URL('../styles/studio-editor-gizmo.css', import.meta.url);

/** Reads one source artifact exactly as shipped by the Studio candidate. */
async function readSource(url) {
	return readFile(url, 'utf8');
}

test('Studio activates current viewport and gizmo presentation without legacy editor mobile CSS', async () => {
	const index = await readSource(studioIndexUrl);
	assert.match(index, /styles\/studio-editor-viewport\.css\?v=awtsmoos-studio-mobile-ux-/);
	assert.match(index, /styles\/studio-editor-gizmo\.css\?v=awtsmoos-studio-mobile-ux-/);
	assert.doesNotMatch(index, /styles\/studio-editor-mobile\.css/);
});

test('viewport and gizmo modules contain the absolute overlay contracts used by current DOM', async () => {
	const [viewportCss, gizmoCss] = await Promise.all([
		readSource(viewportCssUrl),
		readSource(gizmoCssUrl)
	]);
	assert.match(viewportCss, /\.studio-viewport-hud\s*\{[\s\S]*?position:\s*absolute;/);
	assert.match(viewportCss, /\.studio-editor-stage-wrap\s*\{[\s\S]*?aspect-ratio:\s*16\s*\/\s*9;/);
	assert.match(gizmoCss, /\.studio-transform-gizmo\s*\{[\s\S]*?position:\s*absolute;/);
});

test('mobile hierarchy replaces shared flexible shell rows with content-sized flow', async () => {
	const hierarchy = await readSource(hierarchyUrl);
	assert.match(hierarchy, /\.studio-shell\s*\{[\s\S]*?grid-template-rows:\s*none;/);
	assert.match(hierarchy, /\.studio-shell\s*\{[\s\S]*?grid-auto-rows:\s*max-content;/);
	assert.match(hierarchy, /\.studio-grid\s*\{[\s\S]*?grid-template-rows:\s*max-content\s+max-content;/);
	assert.match(hierarchy, /\.studio-grid\s*\{[\s\S]*?align-items:\s*start;/);
	assert.match(hierarchy, /\.studio-editor-viewport\s*\{[\s\S]*?align-self:\s*start;/);
	assert.match(hierarchy, /\.studio-scene-panel\s*\{[\s\S]*?align-self:\s*start;/);
});

test('mobile shell preserves fixed transport and dock clearance', async () => {
	const hierarchy = await readSource(hierarchyUrl);
	assert.match(
		hierarchy,
		/padding-bottom:\s*calc\(136px\s*\+\s*env\(safe-area-inset-bottom\)\);/
	);
});
