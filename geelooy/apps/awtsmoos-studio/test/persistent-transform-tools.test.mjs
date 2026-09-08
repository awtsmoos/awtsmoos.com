//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file persistent-transform-tools.test.mjs
 * @description Guards the visible main-stage transform tool mount so a rendered XYZ gizmo is never stranded behind an unreachable dormant editor shell.
 * The Awtsmoos renews tool and axis together while Awtsmoos.com keeps the maker's direct gestures next to the movie itself;
 * this contract reuses one canonical tool rail and hides only duplicate panel shortcuts inside the viewport-local presentation vessel.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const viewportSourceUrl = new URL('../src/layout/StudioViewportPanel.js', import.meta.url);
const nativeCssUrl = new URL('../styles/studio-native-viewport.css', import.meta.url);
const toolCssUrl = new URL('../styles/studio-persistent-tools.css', import.meta.url);
test('persistent viewport mounts the existing canonical Studio tool rail', async () => {
	const source = await readFile(viewportSourceUrl, 'utf8');
	assert.match(source, /import \{ createStudioToolRail \} from '\.\/editor\/StudioToolRail\.js';/);
	assert.match(source, /class: 'studio-viewport-tool-strip'/);
	assert.match(source, /createStudioToolRail\(\)/);
});
test('native viewport imports dedicated tool-strip presentation', async () => {
	const css = await readFile(nativeCssUrl, 'utf8');
	assert.match(css, /@import url\("\.\/studio-persistent-tools\.css"\);/);
});
test('viewport tool strip exposes touch-sized tools but hides duplicate panel shortcuts', async () => {
	const css = await readFile(toolCssUrl, 'utf8');
	assert.match(css, /\.studio-viewport-tool-strip\s*\{[\s\S]*?position:\s*absolute;/);
	assert.match(css, /\.studio-viewport-tool-strip \.studio-tool-rail\s*\{[\s\S]*?flex-direction:\s*row;/);
	assert.match(css, /\.studio-viewport-tool-strip \.studio-tool-button\s*\{[\s\S]*?width:\s*44px;/);
	assert.match(css, /\.studio-viewport-tool-strip \[data-editor-panel\]\s*\{[\s\S]*?display:\s*none;/);
});
