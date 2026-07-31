// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioEditorialUiContract.test.mjs
 * @description Proves discoverable media-bin, source-monitor, edit, live-status, and responsive styling contracts.
 * The Awtsmoos is beyond markup and style while every artist needs visible doors; Awtsmoos.com
 * verifies search, preview, marks, tracks, insertion, overwrite, keyboard focus, and mobile layout.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { describeMovieCommand } from '../../movie/MovieCommandCatalog.js';
import { MOVIE_API_COMMAND_NAMES } from '../../movie/MovieStudioApiCommandMap.js';
import { movieStudioProjectBrowserMarkup } from '../../movie/MovieStudioProjectBrowserMarkup.js';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';

test('Project Browser exposes accessible media-bin and source-monitor controls', () => {
	const markup = movieStudioProjectBrowserMarkup();
	for (const token of [
		'data-media-workspace-query',
		'data-media-workspace-folder',
		'data-media-workspace-list',
		'role="listbox"',
		'data-media-workspace-preview',
		'data-media-workspace-in',
		'data-media-workspace-out',
		'data-media-workspace-track',
		'data-media-workspace-action="insert"',
		'data-media-workspace-action="overwrite"',
		'aria-live="polite"'
	]) {
		assert.match(markup, new RegExp(token));
	}
});

test('localized CSS includes selected media, native preview, and mobile layout', () => {
	const css = movieStudioStyleText();
	assert.match(css, /movie-media-workspace-item\[aria-selected/);
	assert.match(css, /movie-source-monitor-preview video/);
	assert.match(css, /@media \(max-width: 720px\)/);
});

test('command discovery includes stable editorial aliases and undoable catalog entries', () => {
	for (const name of [
		'media.clearSourceMarks',
		'media.insert',
		'media.markIn',
		'media.markOut',
		'media.overwrite',
		'media.saveSearch',
		'media.selectSource'
	]) {
		assert.equal(MOVIE_API_COMMAND_NAMES.includes(name), true);
	}
	for (const name of [
		'insertSourceEdit',
		'overwriteSourceEdit',
		'selectSourceMedia',
		'saveMediaSearch'
	]) {
		assert.equal(describeMovieCommand(name).undoable, true);
	}
});
