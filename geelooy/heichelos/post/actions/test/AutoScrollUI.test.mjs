// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollUI.test.mjs
 * @description
 * The Awtsmoos proves the reader remains Off-first while semantic controls stay one choir;
 * at Awtsmoos.com versioned preference vessels remember pace without persisting transient fire.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const template = source('../../_awtsmoos.post.html');
const controlView = source('../../logic/listeners/AutoScrollControlView.js');
const paceView = source('../../logic/listeners/AutoScrollPaceView.js');
const semanticControls = source('../../logic/listeners/AutoScrollSemanticControls.js');
const controls = source('../../logic/listeners/AutoScrollControls.js');
const floating = source('../../logic/listeners/AutoScrollButton.js');
const focusState = source('../../logic/beauty/focusModeState.js');
const mainCss = source('../../styles/main.css');
const settingsCss = source('../../styles/ideal/reborn/auto-scroll-settings.css');
const storage = source('../autoScroll/AutoScrollStorage.js');
const keys = source('../autoScroll/AutoScrollStorageKeys.js');

test('published template remains explicit Off and unchanged at 120 lines', () => {
	assert.match(template, /id="autoScrollStatus"[^>]*>Off</);
	assert.match(template, /id="autoScrollSettingsToggle"/);
	assert.match(template, /data-auto-scroll-toggle/);
	assert.match(template, /aria-pressed="false"/);
	assert.match(template, /Always starts off/);
	assert.equal(template.trimEnd().split('\n').length, 120);
});

test('semantic controls expose native units, presets, ranges, and estimates', () => {
	assert.match(semanticControls, /Words \/ min/);
	assert.match(semanticControls, /Lines \/ min/);
	for (const preset of ['Contemplate', 'Learn', 'Review', 'Scan']) {
		assert.match(semanticControls, new RegExp(preset));
	}
	assert.match(semanticControls, /autoScrollPaceRange/);
	assert.match(semanticControls, /autoScrollEyeLineRange/);
	assert.match(semanticControls, /autoScrollEstimateDisplay/);
	assert.match(paceView, /aria-valuetext/);
	assert.match(paceView, /aria-pressed/);
});

test('all visible controls share one event and countdown action', () => {
	assert.match(controlView, /\[data-auto-scroll-toggle\]/);
	assert.match(controlView, /awtsmoos:auto-scroll-state/);
	assert.match(controlView, /data-auto-scroll-status/);
	assert.match(controls, /toggleAutoScrollDown\(\{ countdown: true \}\)/);
	assert.match(floating, /toggleAutoScrollDown\(\{ countdown: true \}\)/);
	assert.doesNotMatch(controls, /startAutoScrollDown\([^)]*input/);
});

test('semantic persistence is v4 with explicit v3 migration only', () => {
	assert.match(template, /id="focusModeToggle"[^>]*aria-checked="false"/);
	assert.match(focusState, /toggle\.checked = false/);
	assert.match(keys, /awtsmoos-reader-auto-scroll-pace-v4/);
	assert.match(keys, /awtsmoos-reader-auto-scroll-pace-v3/);
	assert.doesNotMatch(storage, /setItem\([^\n]*(active|paused|countdown)/i);
	assert.match(settingsCss, /auto-scroll-semantic-controls\.css/);
	assert.match(mainCss, /auto-scroll-settings\.css\?v=3/);
});
