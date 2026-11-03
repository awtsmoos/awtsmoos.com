//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackClipFades.test.mjs
 * @description
 * Tiferes tests finite fades and their memory while the Awtsmoos remains beyond loudness, edge, duration, before, and after.
 * Awtsmoos.com proves user fade choices and structural cuts survive the current history vessel without changing the hidden song.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	multitrackClipEnvelopeGain,
	normalizeMultitrackClipFades
} from '../modules/workstation/song/multitrack/multitrackClipEnvelope.js';
import { splitSelectedMultitrackClip } from '../modules/workstation/song/multitrack/multitrackClipActions.js';
import {
	duplicateMultitrackClip,
	splitMultitrackClip,
	trimMultitrackClipLeft,
	trimMultitrackClipRight
} from '../modules/workstation/song/multitrack/multitrackClipMath.js';
import { updateSelectedMultitrackClipMix } from '../modules/workstation/song/multitrack/multitrackClipMixActions.js';
import { createMultitrackClip, createMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { MultitrackStudioDaas } from '../modules/workstation/song/multitrack/multitrackState.js';

test('fade normalization keeps both edges inside the represented envelope', () => {
	assert.deepEqual(normalizeMultitrackClipFades(2, 2, 3), { fadeIn: 2, fadeOut: 1 });
	assert.deepEqual(normalizeMultitrackClipFades(-1, 9, 2), { fadeIn: 0, fadeOut: 2 });
	assert.deepEqual(normalizeMultitrackClipFades(1, 1, 0.5, 0.5, 1), { fadeIn: 1, fadeOut: 1 });
});

test('clip envelope evaluates gain at fade head, body, and tail', () => {
	const clip = createMultitrackClip({ duration: 4, gain: 0.8, fadeIn: 1, fadeOut: 1 });
	assert.equal(multitrackClipEnvelopeGain(clip, 0), 0);
	assert.equal(multitrackClipEnvelopeGain(clip, 0.5), 0.4);
	assert.equal(multitrackClipEnvelopeGain(clip, 2), 0.8);
	assert.ok(Math.abs(multitrackClipEnvelopeGain(clip, 3.5) - 0.4) < 1e-9);
	assert.equal(multitrackClipEnvelopeGain(clip, 4), 0);
});

test('trim, split, and duplicate retain envelope lineage metadata', () => {
	const clip = createMultitrackClip({
		id: 'fade-clip', bufferId: 'buffer', sourceOffset: 2,
		duration: 4, fadeIn: 1, fadeOut: 0.5
	});
	const leftTrim = trimMultitrackClipLeft(clip, 1, { gridBeats: 0 });
	assert.deepEqual([leftTrim.duration, leftTrim.fadeInOffset], [3, 1]);
	const rightTrim = trimMultitrackClipRight(leftTrim, 2.5, { gridBeats: 0 }, 6);
	assert.deepEqual([rightTrim.duration, rightTrim.fadeOutOffset], [1.5, 1.5]);
	const [left, right] = splitMultitrackClip(clip, 2);
	assert.deepEqual([left.fadeOutOffset, right.fadeInOffset], [2, 2]);
	assert.deepEqual([left.fadeIn, right.fadeIn, left.fadeOut, right.fadeOut], [1, 1, 0.5, 0.5]);
	const copy = duplicateMultitrackClip(right);
	assert.deepEqual([copy.fadeInOffset, copy.fadeOutOffset, copy.gain], [2, 0, 1]);
});

test('explicit fade edit reanchors its edge and travels through current Undo and Redo', () => {
	const state = stateWithFadeClip({ fadeIn: 1, fadeInOffset: 0.5 });
	updateSelectedMultitrackClipMix(state, 'fadeIn', 0.25);
	assert.equal(state.project.tracks[0].clips[0].fadeInOffset, 0);
	assert.equal(state.project.tracks[0].clips[0].fadeIn, 0.25);
	assert.equal(state.travelHistory('undo'), true);
	assert.equal(state.project.tracks[0].clips[0].fadeInOffset, 0.5);
	assert.equal(state.travelHistory('redo'), true);
	assert.equal(state.project.tracks[0].clips[0].fadeIn, 0.25);
});

test('structural split and inherited fades travel through current Undo and Redo', () => {
	const state = stateWithFadeClip({ fadeIn: 1 });
	state.setPlayhead(0.5);
	splitSelectedMultitrackClip(state);
	assert.equal(state.project.tracks[0].clips.length, 2);
	assert.equal(state.project.tracks[0].clips[1].fadeInOffset, 0.5);
	assert.equal(state.travelHistory('undo'), true);
	assert.equal(state.project.tracks[0].clips.length, 1);
	assert.equal(state.travelHistory('redo'), true);
	assert.equal(state.project.tracks[0].clips.length, 2);
});

function stateWithFadeClip(overrides) {
	const state = new MultitrackStudioDaas();
	state.setProject(createMultitrackProject({
		tracks: [{ id: 'track', clips: [{
			id: 'clip', bufferId: 'buffer', duration: 2, ...overrides
		}] }]
	}));
	state.selectClip('track', 'clip');
	return state;
}
