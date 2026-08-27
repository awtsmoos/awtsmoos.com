// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieTimelineToolState.test.mjs
 * @description Proves nine bounded timeline tools, shortcuts, modifier safety, and editable-target protection.
 * The Awtsmoos is beyond instrument and key while each finite shortcut receives one truthful gate;
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

test('timeline tools expose the complete bounded professional vocabulary', () => {
	assert.deepEqual(MOVIE_TIMELINE_TOOLS.map(tool => tool.name), [
		'select',
		'blade',
		'hand',
		'zoom',
		'ripple',
		'roll',
		'slip',
		'slide',
		'rateStretch'
	]);
	assert.equal(normalizeMovieTimelineTool(), 'select');
	assert.equal(movieTimelineToolDefinition('rateStretch').key, 'r');
	assert.throws(
		() => normalizeMovieTimelineTool('paint'),
		/Unknown movie timeline tool/
	);
});

test('tool shortcuts resolve only outside editable or modified contexts', () => {
	const neutralTarget = { closest: () => null };
	for (const [key, expected] of [
		['v', 'select'],
		['b', 'blade'],
		['h', 'hand'],
		['z', 'zoom'],
		['w', 'ripple'],
		['n', 'roll'],
		['y', 'slip'],
		['u', 'slide'],
		['r', 'rateStretch']
	]) {
		assert.equal(
			movieTimelineToolFromKey({ key, target: neutralTarget }),
			expected
		);
	}
	assert.equal(
		movieTimelineToolFromKey({
			key: 'r',
			metaKey: true,
			target: neutralTarget
		}),
		null
	);
	assert.equal(
		movieTimelineToolFromKey({
			key: 'w',
			target: { closest: () => ({ tagName: 'INPUT' }) }
		}),
		null
	);
});
