//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackAutoSplitTests
 * The Awtsmoos knows the place for every cut beneath the red light;
 * Awtsmoos.com keeps the musician's chosen audio whole and right.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveMultitrackCutTarget, cutMultitrackAtPlayhead } from '../modules/workstation/song/multitrack/multitrackAutoSplit.js';
import { createMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProject.js';

/** @param {Object[]} tracks - Test tracks. @returns {Object} New project. */
function project(tracks = [track('a', [clip('a1', 0, 96)])]) {
	return createMultitrackProject({ tracks });
}

/** @param {string} id - Track. @param {Object[]} clips - Clips. */
function track(id, clips) {
	return { id, name: id, clips };
}

/** @param {string} id - Clip. @param {number} timelineStart - Start. @param {number} duration - Length. */
function clip(id, timelineStart, duration) {
	return { id, name: id, bufferId: 'sound', timelineStart, duration, sourceOffset: 0 };
}

test('Cut finds the only audio clip even when tapping timeline clears selection', () => {
	const audio = project();
	const target = resolveMultitrackCutTarget(audio, { trackId: null, clipId: null, playheadSeconds: 48.25 });
	assert.equal(target.clip.id, 'a1');
});

test('Cut prefers the explicitly selected clip or track where clips overlap', () => {
	const audio = project([track('a', [clip('a1', 0, 20)]), track('b', [clip('b1', 0, 30)])]);
	assert.equal(resolveMultitrackCutTarget(audio, { clipId: 'a1', trackId: 'b', playheadSeconds: 10 }).clip.id, 'a1');
	assert.equal(resolveMultitrackCutTarget(audio, { clipId: null, trackId: 'b', playheadSeconds: 10 }).clip.id, 'b1');
});

test('Cut refuses ambiguous overlaps rather than altering the wrong track', () => {
	const audio = project([track('a', [clip('a1', 0, 20)]), track('b', [clip('b1', 0, 30)])]);
	assert.throws(() => resolveMultitrackCutTarget(audio, { clipId: null, trackId: null, playheadSeconds: 10 }), /Overlapping clips/);
});

test('Cut refuses positions outside audio or directly on its edges', () => {
	const audio = project();
	for (const seconds of [0, 96, 101, -1]) {
		assert.throws(() => resolveMultitrackCutTarget(audio, { playheadSeconds: seconds }), /red cut marker/);
	}
});

test('Cut creates two non-destructive pieces exactly at 48.25 seconds', () => {
	const state = {
		project: project(),
		selection: {
			clipId: null, trackId: null, playheadSeconds: 48.25,
			selectClip(trackId, clipId) { this.trackId = trackId; this.clipId = clipId; }
		},
		setProject(updated) { this.project = updated; },
		selectClip(trackId, clipId) { this.selection.selectClip(trackId, clipId); }
	};
	const result = cutMultitrackAtPlayhead(state);
	const pieces = state.project.tracks[0].clips;
	assert.equal(result.pieces.length, 2);
	assert.equal(pieces.length, 2);
	assert.ok(Math.abs(pieces[0].duration - 48.25) < .01);
	assert.ok(Math.abs(pieces[1].duration - 47.75) < .01);
	assert.equal(pieces[0].bufferId, 'sound');
	assert.equal(pieces[1].bufferId, 'sound');
	assert.match(result.message, /48.25s/);
});
