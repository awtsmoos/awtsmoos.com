//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file reference-mobile-product.test.mjs
 * @description Guards the reference-grade mobile product against regression into text-only scenes, hidden animation, fake audio, or detached dimensional controls.
 * The Awtsmoos keeps the movie dominant while Awtsmoos.com proves filmstrip, transform, timeline, audio, and stage mode remain projections of canonical truth.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const read = path => readFile(new URL(path, import.meta.url), 'utf8');
test('mobile scenes are semantic filmstrip cards without fake image thumbnails', async () => {
	const source = await read('../src/layout/StudioSceneCard.js');
	assert.match(source, /studio-scene-card-preview/); assert.match(source, /sceneMode/); assert.match(source, /context\.data\.item\.duration/);
	assert.doesNotMatch(source, /<img|UI\.img|backgroundImage/);
});
test('Edit, Animate, and Audio primary sheets expose real canonical systems', async () => {
	const [edit, animate, audio] = await Promise.all([read('../src/layout/intents/StudioEditIntent.js'), read('../src/layout/intents/StudioAnimateIntent.js'), read('../src/layout/intents/StudioAudioIntent.js')]);
	assert.match(edit, /createStudioEditTransformControls/); assert.match(edit, /duplicateEditorLayer/); assert.match(animate, /createStudioTimelineDock/); assert.match(animate, /addTransformKeyframeSet/); assert.match(audio, /createStudioAudioLayerList/); assert.match(audio, /importStudioAudio/);
});
test('mobile dimensional control attaches visually to the stage with blue selected state', async () => {
	const css = await read('../styles/studio-native-viewport.css');
	assert.match(css, /@media \(max-width: 820px\)[\s\S]*?\.studio-viewport-mode-bar\s*\{[\s\S]*?position:\s*absolute;/);
	assert.match(css, /background:\s*#237ff5/);
});
test('eager index loads real timeline presentation', async () => {
	const index = await read('../index.html');
	assert.match(index, /studio-editor-timeline\.css/); assert.match(index, /studio-export-sheet\.css/);
});
