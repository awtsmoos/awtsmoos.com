//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackRipple.test.mjs
 * @description
 * Gevurah removes one finite clip while Chesed closes only the intended lane gap; the Awtsmoos remains beyond absence and joining.
 * Awtsmoos.com tests default ripple and preserve-gap policy so deletion never shifts unrelated tracks in secret.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMultitrackClip,
	createMultitrackProject,
	createMultitrackTrack
} from '../modules/workstation/song/multitrack/multitrackProject.js';
import { deleteMultitrackClipByPolicy } from '../modules/workstation/song/multitrack/multitrackRipple.js';

function fixture() {
	const removed = createMultitrackClip({ id: 'remove', bufferId: 'a', timelineStart: 2, duration: 3 });
	const later = createMultitrackClip({ id: 'later', bufferId: 'b', timelineStart: 7, duration: 2 });
	const other = createMultitrackClip({ id: 'other', bufferId: 'c', timelineStart: 7, duration: 1 });
	return createMultitrackProject({ tracks: [
		createMultitrackTrack({ id: 'track-a', clips: [removed, later] }),
		createMultitrackTrack({ id: 'track-b', clips: [other] })
	] });
}

test('ripple delete closes later space only on the deleted clip track', () => {
	const project = deleteMultitrackClipByPolicy(fixture(), 'remove', true);
	assert.deepEqual(project.tracks[0].clips.map((clip) => clip.id), ['later']);
	assert.equal(project.tracks[0].clips[0].timelineStart, 4);
	assert.equal(project.tracks[1].clips[0].timelineStart, 7);
});

test('preserve-gap delete leaves later clip positions unchanged', () => {
	const project = deleteMultitrackClipByPolicy(fixture(), 'remove', false);
	assert.equal(project.tracks[0].clips[0].timelineStart, 7);
});
