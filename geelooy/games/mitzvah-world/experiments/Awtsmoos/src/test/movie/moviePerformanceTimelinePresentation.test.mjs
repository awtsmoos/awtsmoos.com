// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceTimelinePresentation.test.mjs
 * @description Proves actor labels, movement summaries, markers, badges, warnings, and safe markup.
 * The Awtsmoos is beyond every lane while finite evidence must remain visible; Awtsmoos.com
 * keeps performer, take, curve, deed, camera, audio, preference, and warning in truthful rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieTimelinePerformancePresentation } from '../../movie/MovieTimelinePerformanceMarkup.js';
import { summarizeMovieTimelinePerformance } from '../../movie/MovieTimelinePerformanceSummary.js';
import {
	addMoviePerformanceTake,
	insertMoviePerformanceTake,
	setPreferredMoviePerformanceTake
} from '../../movie/MoviePerformanceCommands.js';
import {
	performanceProject,
	performanceTake
} from './moviePerformanceFixture.mjs';


test('performance summary reports performer, movement, actions, camera, audio, and preference', () => {
	let project = addMoviePerformanceTake(performanceProject(), performanceTake({
		actionEvents: [{ actionId: 'wave', id: 'wave', phase: 'start', time: 1 }],
		audioClipId: 'audio-one',
		cameraSamples: [{ fov: 50, position: [0, 2, 4], rotation: [0, 0, 0], target: [0, 1, 0], time: 1 }]
	}));
	project = setPreferredMoviePerformanceTake(project, 'take-one');
	project = insertMoviePerformanceTake(project, 'take-one');
	project.performance.performers[0].name = 'Lead Chossid';
	const track = project.tracks[0];
	const clip = track.clips[0];
	const summary = summarizeMovieTimelinePerformance(project, track, clip);
	assert.equal(summary.label, 'Lead Chossid · Walking Take');
	assert.equal(summary.actionCount, 1);
	assert.equal(summary.audio, true);
	assert.equal(summary.camera, true);
	assert.equal(summary.preferred, true);
	assert.ok(summary.movement.distance > 0);
	assert.ok(summary.speedPoints.length >= 2);
	assert.deepEqual(summary.actionMarkers, [50]);
	assert.deepEqual(summary.cameraMarkers, [50]);
});


test('presentation applies evidence data and keeps unsafe labels escaped in markup', () => {
	let project = addMoviePerformanceTake(performanceProject(), performanceTake({
		name: '<script>Take</script>'
	}));
	project = insertMoviePerformanceTake(project, 'take-one');
	const track = project.tracks[0];
	const clip = track.clips[0];
	const presentation = createMovieTimelinePerformancePresentation(project, track, clip);
	const classes = [];
	const element = {
		classList: {
			add(value) {
				classes.push(value);
			}
		},
		dataset: {}
	};
	presentation.apply(element);
	assert.ok(classes.includes('movie-performance-clip'));
	assert.equal(element.dataset.actionCount, '0');
	assert.equal(element.dataset.hasAudio, 'false');
	assert.match(presentation.title, /<script>Take<\/script>/);
	assert.doesNotMatch(presentation.markup, /<script>/);
});


test('missing take presentation exposes an explicit warning instead of crashing', () => {
	const project = performanceProject();
	const track = {
		clips: [],
		id: 'performance-track',
		target: 'player',
		type: 'performance'
	};
	const clip = {
		duration: 1,
		id: 'missing-clip',
		start: 0,
		takeId: 'missing-take'
	};
	const presentation = createMovieTimelinePerformancePresentation(project, track, clip);
	assert.match(presentation.title, /Missing take missing-take/);
	assert.match(presentation.markup, /is-warning/);
});
