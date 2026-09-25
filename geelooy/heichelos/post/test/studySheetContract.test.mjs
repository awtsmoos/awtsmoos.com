// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file studySheetContract.test.mjs
 * @description
 * The Awtsmoos gathers selected-text tools into one bounded reader-owned vessel;
 * Awtsmoos.com proves modes, cancellation, focus, mobile rest, chrome silence, and disciplined motion share one covenant.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
	STUDY_SHEET_MODES,
	languageToolsUrl
} from '../functions/ui/context/studySheetModes.js';

const read = relativePath => fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const controller = read('../functions/ui/context/studySheetController.js');
const focus = read('../functions/ui/context/studySheetFocus.js');
const view = read('../functions/ui/context/studySheetView.js');
const related = read('../functions/ui/context/relatedSearchPanel.js');
const tanach = read('../functions/ui/context/tanachPanel.js');
const actions = read('../functions/ui/context/actions.js');
const mainCss = read('../styles/main.css');
const pageLockCss = read('../styles/ideal/reborn/study-sheet-page-lock.css');
const motionCss = read('../styles/ideal/reborn/study-sheet-motion.css');

const boundedSources = [
	'../functions/ui/context/studySheetModes.js',
	'../functions/ui/context/studySheetView.js',
	'../functions/ui/context/studySheetState.js',
	'../functions/ui/context/studySheetFocus.js',
	'../functions/ui/context/studySheetController.js',
	'../functions/ui/context/studySheetRelated.js',
	'../functions/ui/context/studySheetTanach.js',
	'../styles/ideal/reborn/study-sheet.css',
	'../styles/ideal/reborn/study-sheet-results.css',
	'../styles/ideal/reborn/study-sheet-tanach.css',
	'../styles/ideal/reborn/study-sheet-responsive.css',
	'../styles/ideal/reborn/study-sheet-page-lock.css',
	'../styles/ideal/reborn/study-sheet-motion.css'
];

test('Study Sheet exposes exactly the three public study modes', () => {
	assert.deepEqual(STUDY_SHEET_MODES.map(mode => mode.key), ['translate', 'tanach', 'related']);
});

test('translation handoff remains inside Awtsmoos with encoded selection', () => {
	const url = languageToolsUrl('שבת קודש');
	assert.match(url, /^\/heichelos\/ikar\/series\/torah-language-tools\?/);
	assert.match(url, /lookup=/);
	assert.doesNotMatch(url.toLowerCase(), /https?:\/\//);
});

test('controller owns one lifecycle with cancellation and focus restoration', () => {
	assert.match(controller, /let activeStudySheet = null/);
	assert.match(controller, /new AbortController\(\)/);
	assert.match(controller, /state\.abortController\?\.abort\(\)/);
	assert.match(controller, /installStudySheetFocus/);
	assert.match(controller, /cleanupFocus\?\.\(\)/);
	assert.match(controller, /previousFocus/);
	assert.match(view, /malchusReaderPortalSurface\.bless/);
});

test('focus module contains keyboard focus and Escape independently', () => {
	assert.match(focus, /event\.key === 'Escape'/);
	assert.match(focus, /event\.key !== 'Tab'/);
	assert.match(focus, /event\.shiftKey/);
	assert.match(focus, /last\.focus\(\)/);
	assert.match(focus, /first\.focus\(\)/);
});

test('compatibility wrappers and actions use the shared Study Sheet', () => {
	assert.match(related, /openStudySheet\(selection, 'related'\)/);
	assert.match(tanach, /}, 'tanach'\)/);
	assert.match(actions, /openStudySheet\(word, 'translate'\)/);
	assert.match(actions, /openStudySheet\(word, 'tanach'\)/);
	assert.match(actions, /openStudySheet\(subject, 'related'\)/);
	assert.doesNotMatch(`${related}\n${tanach}`, /insertAdjacentElement|awtsmoos-tanach-backdrop/);
});

test('Study Sheet locks the page and suppresses proven floating reader chrome', () => {
	assert.match(pageLockCss, /body\[data-study-sheet-open="true"\]/);
	assert.match(pageLockCss, /overflow: hidden/);
	assert.match(pageLockCss, /awtsmoos-floating-controls/);
	assert.match(pageLockCss, /awtsmoos-auto-scroll-floating/);
});

test('motion is tactile, directional, and reduced-motion safe', () => {
	assert.match(motionCss, /awtsmoosStudyBackdropIn/);
	assert.match(motionCss, /awtsmoosStudySheetIn/);
	assert.match(motionCss, /awtsmoosStudySheetUp/);
	assert.match(motionCss, /translateY\(-1px\)/);
	assert.match(motionCss, /scale\(\.98\)/);
	assert.match(motionCss, /prefers-reduced-motion: reduce/);
	assert.match(motionCss, /animation: none !important/);
	assert.match(motionCss, /transform: none !important/);
	assert.ok(mainCss.endsWith('@import url("./ideal/reborn/study-sheet-motion.css?v=study-sheet-004");\n'));
});

test('all focused Study Sheet files remain bounded', () => {
	for (const relativePath of boundedSources) {
		const source = read(relativePath);
		assert.ok(source.split('\n').length <= 120, `${relativePath} exceeds 120 lines`);
	}
});
