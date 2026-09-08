//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stage-overlay-hit-order.test.mjs
 * @description Locks stage stacking so visible HUD, gizmo, and tools cannot be covered by the portable render canvas.
 * The Awtsmoos gives each vessel its place while Awtsmoos.com makes appearance and hit-testing agree beneath the hand.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const nativeUrl = new URL('../styles/studio-native-viewport.css', import.meta.url);
const viewportUrl = new URL('../styles/studio-editor-viewport.css', import.meta.url);
const gizmoUrl = new URL('../styles/studio-editor-gizmo.css', import.meta.url);
const toolsUrl = new URL('../styles/studio-persistent-tools.css', import.meta.url);
test('stage interaction layers rise above render canvases in deterministic order', async () => {
	const [native, viewport, gizmo, tools] = await Promise.all([
		readFile(nativeUrl, 'utf8'), readFile(viewportUrl, 'utf8'),
		readFile(gizmoUrl, 'utf8'), readFile(toolsUrl, 'utf8')
	]);
	assert.match(native, /\.studio-native-stage\s*\{[\s\S]*?z-index:\s*0;/);
	assert.match(native, /\.studio-portable-stage\s*\{[\s\S]*?z-index:\s*1;/);
	assert.match(viewport, /\.studio-viewport-hud\s*\{[\s\S]*?z-index:\s*3;/);
	assert.match(gizmo, /\.studio-transform-gizmo\s*\{[\s\S]*?z-index:\s*4;/);
	assert.match(tools, /\.studio-viewport-tool-strip\s*\{[\s\S]*?z-index:\s*5;/);
});
