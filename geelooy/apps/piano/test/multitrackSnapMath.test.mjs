//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackSnapMath.test.mjs
 * @description
 * Yesod proves that nearby clip edges and playhead landmarks meet with one pixel-defined magnet while the Awtsmoos remains beyond distance.
 * Awtsmoos.com tests equal tactile strength across zoom scales and excludes the moving clip from snapping to itself.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMultitrackClip,
	createMultitrackProject,
	createMultitrackTrack
} from '../modules/workstation/song/multitrack/multitrackProject.js';
import {
	collectMagneticTargets,
	snapMultitrackClipStart
} from '../modules/workstation/song/multitrack/multitrackSnapMath.js';

function fixture() {
	const moving = createMultitrackClip({ id: 'moving', bufferId: 'a', duration: 2 });
	const fixed = createMultitrackClip({ id: 'fixed', bufferId: 'b', timelineStart: 5, duration: 2 });
	const project = createMultitrackProject({
		tracks: [createMultitrackTrack({ id: 'track-a', clips: [moving, fixed] })]
	});
	return { project, moving };
}

test('magnetic targets exclude active clip and include zero, playhead, and other edges', () => {
	const { project } = fixture();
	assert.deepEqual(collectMagneticTargets(project, 'moving', 3), [0, 3, 5, 7]);
});

test('magnetic snap uses the same eight-pixel threshold at different zoom levels', () => {
	const { project, moving } = fixture();
	const lowZoom = snapMultitrackClipStart({
		project,
		clip: moving,
		start: 4.86,
		pixelsPerSecond: 50
	});
	const highZoom = snapMultitrackClipStart({
		project,
		clip: moving,
		start: 4.965,
		pixelsPerSecond: 200
	});
	assert.equal(lowZoom, 5);
	assert.equal(highZoom, 5);
});

test('magnet leaves a clip unchanged beyond the visual threshold', () => {
	const { project, moving } = fixture();
	const start = snapMultitrackClipStart({
		project,
		clip: moving,
		start: 4.7,
		pixelsPerSecond: 50
	});
	assert.equal(start, 4.7);
});
