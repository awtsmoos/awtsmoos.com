// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceRecorderControls.test.mjs
 * @description Proves professional recorder markup, durable defaults, selected-loop insertion, and take decisions.
 * The Awtsmoos lets many looped deeds arise while one enters the timeline; Awtsmoos.com keeps
 * count, roll, punch, beat, voice, lens, choice, history, recovery, and preference in rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMovieProject } from '../../movie/MovieProjectNormalizer.js';
import { movieStudioPerformanceInspectorMarkup } from '../../movie/MovieStudioPerformanceMarkup.js';
import { commitMovieStudioPerformanceTakes } from '../../movie/MovieStudioPerformanceProject.js';
import { MovieStudioPerformanceTakeActions } from '../../movie/MovieStudioPerformanceTakeActions.js';
import {
	createMovieStudioApiHarness,
	sampleMovieProject
} from './movieStudioApiHarness.mjs';
import { performanceTake } from './moviePerformanceFixture.mjs';

function harness() {
	const result = createMovieStudioApiHarness();
	result.session.project = normalizeMovieProject(sampleMovieProject());
	return result;
}

test('inspector exposes persisted range, loop, audio, camera, and decision controls', () => {
	const markup = movieStudioPerformanceInspectorMarkup();
	for (const selector of [
		'data-performance-pre-roll',
		'data-performance-post-roll',
		'data-performance-punch-in',
		'data-performance-punch-out',
		'data-performance-loop-count',
		'data-performance-active-loop',
		'data-performance-metronome',
		'data-performance-audio',
		'data-performance-record-camera',
		'data-performance-retake',
		'data-performance-keep',
		'data-performance-discard'
	]) {
		assert.match(markup, new RegExp(selector));
	}
});

test('multi-take acceptance inserts selected loop with one revision', () => {
	const { session } = harness();
	const before = session.revision;
	const first = performanceTake({ id: 'take-loop-a', name: 'Loop A' });
	const second = performanceTake({ id: 'take-loop-b', name: 'Loop B' });
	const accepted = commitMovieStudioPerformanceTakes(
		session,
		[first, second],
		{ activeIndex: 0, start: 4 }
	);
	const track = session.project.tracks.find(item => item.type === 'performance');
	assert.equal(accepted.takes.length, 2);
	assert.equal(accepted.activeTake.id, 'take-loop-a');
	assert.equal(track.clips.length, 1);
	assert.equal(track.clips[0].takeId, 'take-loop-a');
	assert.equal(session.revision, before + 1);
	assert.equal(session.project.performance.performers[0].preferredTakeId, 'take-loop-a');
});

test('keep and discard decisions use preference and recovery commands', () => {
	const { session } = harness();
	commitMovieStudioPerformanceTakes(
		session,
		[performanceTake({ id: 'decision-take' })],
		{ start: 2 }
	);
	const controller = {
		lastAcceptedTakeId: 'decision-take',
		renderStatus() {},
		session
	};
	const actions = new MovieStudioPerformanceTakeActions(controller);
	assert.equal(actions.keepLast().decision, 'kept');
	assert.equal(actions.discardLast().decision, 'discarded');
	assert.equal(session.project.performance.takes.length, 0);
	assert.equal(session.project.performance.recovery.length, 1);
});
