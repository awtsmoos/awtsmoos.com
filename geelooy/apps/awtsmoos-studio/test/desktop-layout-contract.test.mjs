//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file desktop-layout-contract.test.mjs
 * @description Guards Studio's dedicated six-row desktop containment module so editor depth remains inside one viewport instead of pushing tools below the visible hand.
 * The Awtsmoos gives header, status, workspace, canvas, template shelf, and transport their proper measures while Awtsmoos.com keeps deep panels internally scrollable;
 * this contract ensures direct manipulation stays physically reachable at desktop height.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const desktopCssUrl = new URL('../styles/studio-desktop-layout.css', import.meta.url);
const shellCssUrl = new URL('../styles/studio-shell-ux.css', import.meta.url);
async function read(url) { return readFile(url, 'utf8'); }
test('shell imports dedicated desktop containment', async () => {
	const css = await read(shellCssUrl);
	assert.match(css, /@import url\("\.\/studio-desktop-layout\.css"\);/);
	assert.match(css, /\.studio-title\s*\{[\s\S]*?margin:\s*0;/);
});
test('desktop shell assigns six visible rows inside one viewport', async () => {
	const css = await read(desktopCssUrl);
	assert.match(css, /\.studio-shell\s*\{[\s\S]*?height:\s*100dvh;/);
	assert.match(css, /grid-template-rows:\s*auto auto auto minmax\(0, 1fr\) 150px auto;/);
	assert.match(css, /\.studio-shell\s*\{[\s\S]*?overflow:\s*hidden;/);
});
test('desktop editor and panels contain their own depth', async () => {
	const css = await read(desktopCssUrl);
	assert.match(css, /\.studio-grid\s*\{[\s\S]*?overflow:\s*hidden;/);
	assert.match(css, /\.studio-editor-viewport\s*\{[\s\S]*?grid-template-rows:\s*minmax\(0, 1fr\) auto;/);
	assert.match(css, /\.studio-inspector-panel > \.aw-ui-panel__body\s*\{[\s\S]*?overflow:\s*auto;/);
});
