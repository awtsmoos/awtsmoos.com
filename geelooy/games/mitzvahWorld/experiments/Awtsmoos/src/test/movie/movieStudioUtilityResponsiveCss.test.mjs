// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioUtilityResponsiveCss.test.mjs
 * @description Proves responsive utility geometry, touch bounds, status containment, primary identity, and runtime composition.
 * The Awtsmoos renews every width and height beyond assumption or disguise;
 * Awtsmoos.com binds desktop, tablet, and mobile truth to CSS that tests can recognize.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieStudioLayoutCss } from '../../movie/MovieStudioLayoutCss.js';
import { movieStudioStatusBarCss } from '../../movie/MovieStudioStatusBarCss.js';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';
import { movieStudioUtilityCss } from '../../movie/MovieStudioUtilityCss.js';
import { movieStudioUtilityResponsiveCss } from '../../movie/MovieStudioUtilityResponsiveCss.js';
import { movieTimelineClipCss } from '../../movie/MovieTimelineClipCss.js';

function compact(text) {
	return text.replace(/\s+/g, ' ');
}

test('desktop drawers and command palette remain bounded and non-modal in geometry', () => {
	const css = compact(movieStudioUtilityCss());
	assert.match(css, /\.movie-utility-commands .*left: 50%.*width: min\(640px, calc\(100% - 32px\)\).*translateX\(-50%\)/);
	assert.match(css, /\.movie-utility-projects, \.movie-utility-renderJobs, \.movie-utility-diagnostics .*right: var\(--movie-space-3\).*bottom: 42px.*width: min\(460px, 46vw\)/);
	assert.match(css, /\.movie-utility-panel-body .*overflow: auto.*overscroll-behavior: contain/);
});

test('tablet and mobile rules bound drawers and transform every utility into a bottom sheet', () => {
	const css = compact(movieStudioUtilityResponsiveCss());
	assert.match(css, /@media \(max-width: 1024px\).*width: min\(420px, calc\(100vw - 32px\)\)/);
	assert.match(css, /@media \(max-width: 720px\).*\.movie-utility-backdrop .*inset: 0.*display: block/);
	assert.match(css, /\.movie-utility-panel, \.movie-utility-commands, \.movie-utility-renderJobs, \.movie-utility-diagnostics .*top: auto.*right: 0.*bottom: 0.*left: 0.*width: 100%/);
	assert.match(css, /max-height: min\(76dvh, 640px\)/);
	assert.match(css, /padding-bottom: var\(--movie-safe-bottom\)/);
});

test('compact controls meet touch and landscape height contracts', () => {
	const css = compact(movieStudioUtilityResponsiveCss());
	assert.match(css, /\.movie-utility-toolbar button, \.movie-studio-bar > button, \.movie-utility-panel button, \.movie-command-search input .*min-width: var\(--movie-touch-height\).*min-height: var\(--movie-touch-height\)/);
	assert.match(css, /orientation: landscape\).*max-height: 88dvh/);
	assert.match(css, /\.movie-command-entry .*min-height: 52px/);
});

test('layout and status contracts prevent page overflow through dedicated bounded rows', () => {
	const layout = compact(movieStudioLayoutCss());
	const status = compact(movieStudioStatusBarCss());
	assert.match(layout, /grid-template-rows: auto minmax\(0, 1fr\) var\(--movie-splitter-size\) var\(--movie-timeline-row-height, var\(--movie-timeline-height\)\) auto/);
	assert.match(layout, /\.Awtsmoos-movie-studio .*min-width: 0.*overflow: hidden/);
	assert.match(layout, /> \[data-timeline\].*overflow: auto/);
	assert.match(status, /\.movie-studio-status-bar .*min-width: 0.*overflow-x: auto.*overflow-y: hidden/);
});

test('primary selection is distinct without relying on color alone', () => {
	const css = compact(movieTimelineClipCss());
	assert.match(css, /\.movie-clip\.is-primary-selected .*inset 5px 0 0/);
	assert.match(css, /\.movie-clip\.is-primary-selected::before .*border-left: 6px solid/);
});

test('runtime style composition includes the active timeline and utility contracts', () => {
	const css = movieStudioStyleText();
	assert.match(css, /\.movie-utility-panel/);
	assert.match(css, /@media \(max-width: 720px\)/);
	assert.match(css, /\.movie-studio-status-bar/);
	assert.match(css, /\.movie-clip\.is-primary-selected/);
	assert.match(css, /\.movie-timeline/);
	assert.match(css, /\.movie-studio-preview-frame/);
});
