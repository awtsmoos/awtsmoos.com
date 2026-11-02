//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackClipFades.test.mjs
 * @description
 * Tiferes tests the rise and release of finite clips while the Awtsmoos remains beyond loudness, edge, and duration.
 * Awtsmoos.com proves fades survive project edits and history, so visual decisions become the same audible song in every revelation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	multitrackClipEnvelopeGain,
	normalizeMultitrackClipFades
} from '../modules/workstation/song/multitrack/multitrackClipEnvelope.js';
import {
	duplicateMultitrackClip,
	splitMultitrackClip,
	trimMultitrackClipLeft,
	trimMultitrackClipRight
} from '../modules/workstation/song/multitrack/multitrackClipMath.js';
import { updateSelectedMultitrackClipMix } from '../modules/workstation/song/multitrack/multitrackClipMixActions.js';
import { createMultitrackClip, createMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { MultitrackStudioDaas } from '../modules/workstation/song/multitrack/multitrackState.js';

test('fade normalization keeps both edges inside audible duration', () => {
	assert.deepEqual(normalizeMultitrackClipFades(2, 2, 3), { fadeIn: 2, fadeOut: 1 });
	assert.deepEqual(normalizeMultitrackClipFades(-1, 9, 2), { fadeIn: 0, fadeOut: 2 });
});

test('clip envelope evaluates gain at fade head, body, and tail', () => {
	const clip = createMultitrackClip({ duration: 4, gain: 0.8, fadeIn: 1, fadeOut: 1 });
	assert.equal(multitrackClipEnvelopeGain(clip, 0), 0);
	assert.equal(multitrackClipEnvelopeGain(clip, 0.5), 0.4);
	assert.equal(multitrackClipEnvelopeGain(clip, 2), 0.8);
	assert.ok(Math.abs(multitrackClipEnvelopeGain(clip, 3.5) - 0.4) < 1e-9);
	assert.equal(multitrackClipEnvelopeGain(clip, 4), 0);
});

test('trim, split, and duplicate preserve valid outer-edge fades', () => {
	const clip = createMultitrackClip({
		id: 'fade-clip',
		bufferId: 'buffer',
		duration: 4,
		fadeIn: 1,
		fadeOut: 0.5
	});
	const leftTrim = trimMultitrackClipLeft(clip, 1, { gridBeats: 0 });
	assert.deepEqual([leftTrim.duration, leftTrim.fadeIn, leftTrim.fadeOut], [3, 1, 0.5]);
	const rightTrim = trimMultitrackClipRight(leftTrim, 2.5, { gridBeats: 0 }, 4);
	assert.deepEqual([rightTrim.duration, rightTrim.fadeIn, rightTrim.fadeOut], [1.5, 1, 0.5]);
	const [left, right] = splitMultitrackClip(clip, 2);
	assert.deepEqual([left.fadeIn, left.fadeOut, right.fadeIn, right.fadeOut], [1, 0, 0, 0.5]);
	const copy = duplicateMultitrackClip(clip);
	assert.deepEqual([copy.fadeIn, copy.fadeOut, copy.gain], [1, 0.5, 1]);
});

test('clip fade edits are undoable project history', () => {
	const state = new MultitrackStudioDaas();
	const project = createMultitrackProject({
		tracks: [{ id: 'track', clips: [{ id: 'clip', bufferId: 'buffer', duration: 3 }] }]
	});
	state.setProject(project, { recordHistory: false });
	state.selection.selectClip('track', 'clip');
	updateSelectedMultitrackClipMix(state, 'fadeIn', 0.75);
	assert.equal(state.project.tracks[0].clips[0].fadeIn, 0.75);
	assert.equal(state.history.canUndo, true);
	state.undo();
	assert.equal(state.project.tracks[0].clips[0].fadeIn, 0);
	state.redo();
	assert.equal(state.project.tracks[0].clips[0].fadeIn, 0.75);
});
