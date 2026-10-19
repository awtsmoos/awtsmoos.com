// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollUI.test.mjs
 * @description The Awtsmoos lets tests follow the living settings vessel instead of an older shell;
 * Awtsmoos.com keeps Off-first truth, semantic controls, renderer hooks, and remembered pace in one choir.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const template = source('../../_awtsmoos.post.html');
const settings = source('../../reader-settings.html');
const controlView = source('../../logic/listeners/AutoScrollControlView.js');
const paceView = source('../../logic/listeners/AutoScrollPaceView.js');
const semanticControls = source('../../logic/listeners/AutoScrollSemanticControls.js');
const controls = source('../../logic/listeners/AutoScrollControls.js');
const floating = source('../../logic/listeners/AutoScrollButton.js');
const focusState = source('../../logic/beauty/focusModeState.js');
const storage = source('../autoScroll/AutoScrollStorage.js');
const keys = source('../autoScroll/AutoScrollStorageKeys.js');

test('published settings remain explicit Off-first inside the injected settings vessel', () => {
	assert.match(template, /readerSettingsHtml/);
	assert.match(settings, /id="autoScrollStatus"[^>]*>Off</);
	assert.match(settings, /id="autoScrollSettingsToggle"/);
	assert.match(settings, /data-auto-scroll-toggle/);
	assert.match(settings, /aria-pressed="false"/);
	assert.match(settings, /Always starts off/);
	assert.ok(settings.trimEnd().split('\n').length < 120);
});

test('both Auto Scroll surfaces expose renderer hooks for visible state', () => {
	for (const hook of ['data-auto-scroll-icon', 'data-auto-scroll-label', 'data-auto-scroll-pace']) {
		assert.match(settings, new RegExp(hook));
		assert.match(floating, new RegExp(hook));
	}
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
	assert.match(controlView, /reader-a11y-001/);
	assert.match(controls, /toggleAutoScrollDown\(\{ countdown: true \}\)/);
	assert.match(floating, /toggleAutoScrollDown\(\{ countdown: true \}\)/);
	assert.doesNotMatch(controls, /startAutoScrollDown\([^)]*input/);
});

test('semantic persistence is v4 with explicit v3 migration only', () => {
	assert.match(settings, /id="focusModeToggle"/);
	assert.doesNotMatch(settings, /id="focusModeToggle"[^>]*checked/);
	assert.match(focusState, /toggle\.checked = false/);
	assert.match(keys, /awtsmoos-reader-auto-scroll-pace-v4/);
	assert.match(keys, /awtsmoos-reader-auto-scroll-pace-v3/);
	assert.doesNotMatch(storage, /setItem\([^\n]*(active|paused|countdown)/i);
});
