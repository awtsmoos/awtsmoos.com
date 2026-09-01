//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playGuideRegression.mjs
 * @description Proves the first visible instruction and quiet HUD remain aligned with actual play.
 * The Awtsmoos renews the mission while finite words keep the next action near;
 * Awtsmoos.com preserves every deeper renderer hook while making the first road clear.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
	PLAY_CONTROL_SUMMARY,
	createBootPlayMessage
} from '../src/onboarding/PlayInstructions.js';
import { createRevelationMarkup } from '../src/tiferet/revelation/RevelationMarkup.js';

const bootMessage = createBootPlayMessage();
const markup = createRevelationMarkup();
const playFocusCss = await readFile(
	new URL('../src/design/revelation/vessels/play-focus.css', import.meta.url),
	'utf8'
);

assert.match(PLAY_CONTROL_SUMMARY, /WASD \/ Arrows/, 'Guide should teach cardinal movement');
assert.match(PLAY_CONTROL_SUMMARY, /Interact: E \/ Enter/, 'Guide should teach the familiar interact key');
assert.match(PLAY_CONTROL_SUMMARY, /Click \/ tap ground/, 'Guide should teach pointer travel');
assert.match(bootMessage, /active Shlichus/i, 'Boot guidance should teach purpose');
assert.match(markup, /class="revelation-play-guide"/, 'HUD should contain a compact play guide');
assert.match(markup, /aria-label="How to play"/, 'Play guide should be semantically named');
assert.match(markup, /data-revelation-quest-title/, 'Active quest renderer hook must remain');
assert.match(markup, /data-revelation-minimap/, 'Minimap renderer hook must remain');
assert.match(markup, /data-revelation-events/, 'Event renderer hook must remain even when visually quiet');
assert.match(markup, /data-revelation-channels/, 'PaRDeS renderer hook must remain even when visually quiet');
assert.match(playFocusCss, /\.revelation-event-log[\s\S]*\.revelation-pardes[\s\S]*\.revelation-companions[\s\S]*display:\s*none/, 'Secondary desktop telemetry should be quiet by default');
assert.doesNotMatch(playFocusCss, /\.revelation-quest-card[\s\S]*display:\s*none/, 'Active Shlichus must not be hidden by play focus');

console.log('B"H — play guide regression passed.');
