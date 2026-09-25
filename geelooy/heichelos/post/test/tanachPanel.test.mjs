// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tanachPanel.test.mjs
 * @description
 * The Awtsmoos keeps exact Tanach pagination within the one shared Study Sheet;
 * Awtsmoos.com proves focus containment, compact rows, and responsive geometry belong to one reader surface.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = relativePath => fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const wrapper = read('../functions/ui/context/tanachPanel.js');
const controller = read('../functions/ui/context/studySheetController.js');
const focus = read('../functions/ui/context/studySheetFocus.js');
const mode = read('../functions/ui/context/studySheetTanach.js');
const view = read('../functions/ui/context/tanachPanelView.js');
const coreStyles = read('../styles/ideal/reborn/study-sheet.css');
const responsiveStyles = read('../styles/ideal/reborn/study-sheet-responsive.css');

test('Tanach compatibility wrapper enters shared Study Sheet mode', () => {
	assert.match(wrapper, /openStudySheet/);
	assert.match(wrapper, /}, 'tanach'\)/);
	assert.doesNotMatch(wrapper, /createElement/);
	assert.doesNotMatch(wrapper, /awtsmoos-tanach-backdrop/);
});

test('shared lifecycle owns stale abort while focus module owns keyboard containment', () => {
	assert.match(controller, /new AbortController\(\)/);
	assert.match(controller, /abortController\.signal\.aborted/);
	assert.match(controller, /activeStudySheet !== state/);
	assert.match(controller, /installStudySheetFocus/);
	assert.match(controller, /state\.previousFocus\.focus\(\)/);
	assert.match(focus, /event\.key === 'Escape'/);
	assert.match(focus, /event\.key !== 'Tab'/);
});

test('Tanach mode owns exact pagination and fetch failure truth', () => {
	assert.match(mode, /PAGE_SIZE = 10/);
	assert.match(mode, /exact: 'true'/);
	assert.match(mode, /offset: String\(state\.offset\)/);
	assert.match(mode, /response\.ok/);
	assert.match(mode, /signal: state\.signal/);
	assert.match(mode, /No exact Tanach verses matched/);
});

test('Tanach view is content-only and preserves exact occurrence semantics', () => {
	assert.match(view, /occurrenceCount/);
	assert.match(view, /summaryText/);
	assert.match(view, /Open verse →/);
	assert.match(view, /Hebrew \+ English/);
	assert.doesNotMatch(view, /aria-modal/);
	assert.doesNotMatch(view, /awtsmoos-tanach-backdrop/);
});

test('shared styles provide focus visibility, scroll lock, and mobile bottom-sheet geometry', () => {
	assert.match(coreStyles, /focus-visible/);
	assert.match(responsiveStyles, /84dvh/);
	assert.match(responsiveStyles, /max-width: 42rem/);
	assert.match(responsiveStyles, /data-study-sheet-open/);
	assert.match(responsiveStyles, /overflow: hidden/);
});
