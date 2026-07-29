// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieTimelineToolState.test.mjs
 * @description Proves bounded tool names, definitions, shortcuts, modifier safety, and editable-target protection.
 * The Awtsmoos is beyond key and instrument while each finite shortcut receives one truthful gate;
 * Awtsmoos.com keeps typing vessels untouched and rejects every unknown creative state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MOVIE_TIMELINE_TOOLS,
	movieTimelineToolDefinition,
	movieTimelineToolFromKey,
	normalizeMovieTimelineTool
} from '../../movie/MovieTimelineToolState.js';

test('timeline tools expose one bounded canonical vocabulary', () => {
	assert.deepEqual(MOVIE_TIMELINE_TOOLS.map(tool => tool.name), [
		'select',
		'blade',
		'hand',
		'zoom'
	]);
	assert.equal(normalizeMovieTimelineTool(), 'select');
	assert.equal(normalizeMovieTimelineTool('BLADE'), 'blade');
	assert.equal(movieTimelineToolDefinition('hand').key, 'h');
	assert.throws(
		() => normalizeMovieTimelineTool('paint'),
		error => error.code === 'UNKNOWN_MOVIE_TIMELINE_TOOL'
	);
});

test('V B H Z shortcuts resolve only outside editable or modified contexts', () => {
	const neutralTarget = { closest: () => null };
	for (const [key, expected] of [
		['v', 'select'],
		['B', 'blade'],
		['h', 'hand'],
		['Z', 'zoom']
	]) {
		assert.equal(movieTimelineToolFromKey({ key, target: neutralTarget }), expected);
	}
	assert.equal(movieTimelineToolFromKey({ key: 'b', metaKey: true, target: neutralTarget }), null);
	assert.equal(movieTimelineToolFromKey({ key: 'h', altKey: true, target: neutralTarget }), null);
	assert.equal(movieTimelineToolFromKey({
		key: 'z',
		target: { closest: () => ({ tagName: 'INPUT' }) }
	}), null);
	assert.equal(movieTimelineToolFromKey({ key: 'q', target: neutralTarget }), null);
});
