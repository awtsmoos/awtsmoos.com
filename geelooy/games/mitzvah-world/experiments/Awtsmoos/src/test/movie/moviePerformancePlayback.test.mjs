// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformancePlayback.test.mjs
 * @description Proves clip timing, actor restoration, phased actions, and recorded camera playback.
 * The Awtsmoos lets performance descend and depart without erasing authored truth; Awtsmoos.com
 * keeps actor, action, lens, mute, speed, loop, and restoration deterministic in cinematic rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MoviePerformanceDirector } from '../../movie/MoviePerformanceDirector.js';
import {
	moviePerformanceClipLocalTime,
	resolveMoviePerformanceClips
} from '../../movie/MoviePerformanceClipResolver.js';
import {
	addMoviePerformanceTake,
	insertMoviePerformanceTake
} from '../../movie/MoviePerformanceCommands.js';
import {
	performanceProject,
	performanceTake
} from './moviePerformanceFixture.mjs';
import { moviePerformancePlaybackRuntime } from './moviePerformancePlaybackRuntime.mjs';


test('clip source time honors speed, offset, loop, and solo state', () => {
	let project = addMoviePerformanceTake(performanceProject(), performanceTake());
	project = insertMoviePerformanceTake(project, 'take-one', {
		duration: 6,
		loop: true,
		offset: 0.5,
		speed: 2,
		start: 1
	});
	const clip = project.tracks[0].clips[0];
	const take = project.performance.takes[0];
	assert.equal(moviePerformanceClipLocalTime(clip, take, 2), 0.5);
	assert.equal(resolveMoviePerformanceClips(project, 2).length, 1);
	project.tracks.push({
		clips: [], id: 'silent-solo', muted: false, solo: true,
		target: 'other', type: 'performance'
	});
	assert.equal(resolveMoviePerformanceClips(project, 2).length, 0);
});


test('performance applies, dispatches action, records camera, then restores baseline', () => {
	const runtime = moviePerformancePlaybackRuntime();
	let project = addMoviePerformanceTake(performanceProject(), performanceTake({
		actionEvents: [{ actionId: 'wave', id: 'wave', phase: 'start', time: 0.5 }],
		cameraMode: 'recorded',
		cameraSamples: [
			{ fov: 50, position: [0, 2, 5], rotation: [0, 0, 0], target: [0, 1, 0], time: 0 },
			{ fov: 60, position: [2, 3, 4], rotation: [0, 0.2, 0], target: [1, 1, 0], time: 2 }
		]
	}));
	project = insertMoviePerformanceTake(project, 'take-one', { start: 0 });
	const director = new MoviePerformanceDirector(runtime, project);
	director.beginFrame();
	const frame = director.apply(1);
	assert.equal(runtime.state.z, -1);
	assert.equal(frame.dispatched.length, 1);
	assert.equal(runtime.messages[0].type, 'PLAYER_ACTION_WAVE');
	assert.equal(runtime.camera.position.x, 1);
	director.beginFrame();
	assert.equal(runtime.state.z, 0);
	assert.equal(runtime.camera.position.x, 0);
	project.tracks[0].muted = true;
	director.setProject(project);
	assert.equal(director.apply(1).actors.length, 0);
	director.destroy();
});
