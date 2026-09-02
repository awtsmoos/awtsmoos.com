//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackProject.test.mjs
 * @description
 * Malchus proves that many tracks remain findable and replaceable while the Awtsmoos remains beyond every collection and identifier.
 * Awtsmoos.com tests fresh project snapshots so future undo and redraw can stand on structure rather than mutation surprise.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMultitrackClip,
	createMultitrackProject,
	createMultitrackTrack,
	findMultitrackClip,
	multitrackProjectDuration
} from '../modules/workstation/song/multitrack/multitrackProject.js';
import {
	addMultitrackClip,
	removeMultitrackClip,
	replaceClipWithMany
} from '../modules/workstation/song/multitrack/multitrackProjectEdits.js';

function fixture() {
	const clip = createMultitrackClip({
		id: 'clip-a',
		bufferId: 'buffer-a',
		timelineStart: 1,
		duration: 3
	});
	const track = createMultitrackTrack({
		id: 'track-a',
		clips: [clip]
	});
	return {
		clip,
		track,
		project: createMultitrackProject({
			id: 'project-a',
			tracks: [track]
		})
	};
}

test('project duration follows the latest clip ending', () => {
	const { project, track } = fixture();
	const later = createMultitrackClip({
		id: 'clip-b',
		bufferId: 'buffer-b',
		timelineStart: 7,
		duration: 2
	});
	const updated = addMultitrackClip(project, track.id, later);
	assert.equal(multitrackProjectDuration(updated), 9);
});

test('clip lookup returns its owning track', () => {
	const { project } = fixture();
	const match = findMultitrackClip(project, 'clip-a');
	assert.equal(match.track.id, 'track-a');
	assert.equal(match.clip.bufferId, 'buffer-a');
});

test('remove and split replacement return fresh project snapshots', () => {
	const { project } = fixture();
	const left = createMultitrackClip({ id: 'left', bufferId: 'buffer-a', duration: 1 });
	const right = createMultitrackClip({ id: 'right', bufferId: 'buffer-a', timelineStart: 1, duration: 2 });
	const split = replaceClipWithMany(project, 'clip-a', [left, right]);
	assert.notEqual(split, project);
	assert.deepEqual(split.tracks[0].clips.map((clip) => clip.id), ['left', 'right']);
	const removed = removeMultitrackClip(split, 'left');
	assert.deepEqual(removed.tracks[0].clips.map((clip) => clip.id), ['right']);
});
