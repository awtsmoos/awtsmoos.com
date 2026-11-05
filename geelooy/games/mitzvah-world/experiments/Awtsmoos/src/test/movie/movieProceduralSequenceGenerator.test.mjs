// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProceduralSequenceGenerator.test.mjs
 * @description Proves the procedural sequence generator emits projects that are
 * valid against movies/movie-project.schema.json: required fields, track/clip
 * enums, timeline bounds, and deterministic output. Also proves the render
 * export degrades gracefully without MediaRecorder.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	applyProceduralMovieToCinema,
	createDreamHangoutScript,
	generateProceduralMovieProject,
	installProceduralMovieProject,
	renderProceduralMovieProject,
	PROCEDURAL_SEQUENCE_MOODS
} from '../../movie/MovieProceduralSequenceGenerator.js';

const schemaPath = fileURLToPath(new URL(
	'../../../../../movies/movie-project.schema.json',
	import.meta.url
));
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const defs = schema.$defs || schema.definitions;
const clipDef = defs.clip;
const trackDef = defs.track;

/** Focused validator driven by the real schema's required/enum/bound constraints. */
function validateProject(project) {
	const errors = [];
	const check = (condition, message) => { if (!condition) errors.push(message); };

	for (const field of schema.required || []) {
		check(project[field] !== undefined, `missing required top-level field: ${field}`);
	}
	check(typeof project.title === 'string' && project.title.length > 0, 'title must be a non-empty string');
	check(typeof project.duration === 'number' && project.duration > 0, 'duration must be positive');
	check(Array.isArray(project.tracks) && project.tracks.length > 0, 'tracks must be a non-empty array');

	const trackTypes = new Set(trackDef.properties.type.enum);
	const actionEnum = new Set(clipDef.properties.action.enum);
	const easingEnum = new Set(clipDef.properties.easing.enum);
	const transitionEnum = new Set(clipDef.properties.transition.enum);
	const kindEnum = new Set(clipDef.properties.kind.enum);

	for (const track of project.tracks || []) {
		check(trackTypes.has(track.type), `unknown track type: ${track.type}`);
		check(Array.isArray(track.clips) && track.clips.length >= 1, `track ${track.type} must have clips`);
		for (const clip of track.clips || []) {
			const where = `${track.type}/${clip.id || '?'}`;
			check(typeof clip.start === 'number' && clip.start >= 0, `${where}: start must be >= 0`);
			check(typeof clip.duration === 'number' && clip.duration > 0, `${where}: duration must be > 0`);
			check(
				clip.start + clip.duration <= project.duration + 0.001,
				`${where}: clip exceeds project duration`
			);
			if (clip.action !== undefined) check(actionEnum.has(clip.action), `${where}: bad action ${clip.action}`);
			if (clip.easing !== undefined) check(easingEnum.has(clip.easing), `${where}: bad easing ${clip.easing}`);
			if (clip.transition !== undefined) {
				check(transitionEnum.has(clip.transition), `${where}: bad transition ${clip.transition}`);
			}
			if (clip.kind !== undefined) check(kindEnum.has(clip.kind), `${where}: bad kind ${clip.kind}`);
			if (clip.volume !== undefined) {
				check(clip.volume >= 0 && clip.volume <= 1, `${where}: volume out of range`);
			}
			for (const endpoint of [clip.from, clip.to]) {
				if (endpoint && typeof endpoint === 'object') {
					for (const point of [endpoint.position, endpoint.target]) {
						if (point && typeof point === 'object') {
							for (const axis of ['x', 'y', 'z']) {
								if (point[axis] !== undefined) {
									check(typeof point[axis] === 'number', `${where}: point axis not a number`);
								}
							}
						}
					}
				}
			}
		}
	}
	return errors;
}

test('Dream Hangout generates a schema-valid 4-scene project', () => {
	const { project, script } = generateProceduralMovieProject(createDreamHangoutScript());
	const errors = validateProject(project);
	assert.deepEqual(errors, [], `schema violations:\n${errors.join('\n')}`);
	assert.equal(project.title, 'Dream Hangout');
	assert.equal(project.duration, 64);
	assert.equal(project.fps, 24);
	const sceneTrack = project.tracks.find(track => track.type === 'scene');
	assert.equal(sceneTrack.clips.length, 4);
	assert.deepEqual(
		sceneTrack.clips.map(clip => clip.label),
		['Fireflies Night', 'Sunrise Circle', 'Forest Pool', 'Oasis Night']
	);
	assert.deepEqual(
		sceneTrack.clips.map(clip => clip.world.atmosphere.timeOfDay),
		['night', 'sunrise', 'day', 'night']
	);
	assert.equal(script.shots.length, 4);
	const fireflyGraphs = (project.graphs || []).filter(graph => graph.kind === 'particle');
	assert.ok(
		fireflyGraphs.length >= 1,
		'night moods attach a living-particle graph from the existing particle system'
	);
	assert.ok(
		fireflyGraphs.some(graph => graph.nodes?.[0]?.value?.mode === 'fireflies'),
		'firefly particle preset is bound'
	);
});

test('all mood timeOfDay values use the game sky vocabulary', () => {
	for (const [name, recipe] of Object.entries(PROCEDURAL_SEQUENCE_MOODS)) {
		assert.ok(
			['day', 'sunrise', 'night'].includes(recipe.timeOfDay),
			`mood ${name} has non-sky timeOfDay ${recipe.timeOfDay}`
		);
	}
});

test('explicit shot lists are honored and stay schema-valid', () => {
	const { project } = generateProceduralMovieProject({
		title: 'Custom Short',
		seed: 42,
		shots: [
			{
				mood: 'sunrise-gold',
				rig: 'orbitRight',
				duration: 10,
				label: 'Golden Orbit',
				actor: { action: 'pray' },
				dialogue: 'A new day.',
				audio: [{ kind: 'wind', volume: 0.3 }]
			},
			{ mood: 'day', duration: 8, label: 'Meadow Walk', actor: { action: 'walk' } }
		]
	});
	const errors = validateProject(project);
	assert.deepEqual(errors, [], `schema violations:\n${errors.join('\n')}`);
	assert.equal(project.duration, 18);
	const sceneTrack = project.tracks.find(track => track.type === 'scene');
	assert.deepEqual(sceneTrack.clips.map(clip => clip.label), ['Golden Orbit', 'Meadow Walk']);
	const cameraTrack = project.tracks.find(track => track.type === 'camera');
	assert.equal(cameraTrack.clips[0].shot, 'orbitRight');
	const actorTrack = project.tracks.find(track => track.type === 'actor');
	assert.deepEqual(actorTrack.clips.map(clip => clip.action), ['pray', 'walk']);
});

test('generation is deterministic for a fixed seed', () => {
	const first = generateProceduralMovieProject(createDreamHangoutScript()).project;
	const second = generateProceduralMovieProject(createDreamHangoutScript()).project;
	assert.deepEqual(first, second);
});

test('theme-less scripts auto-generate a valid shot list', () => {
	const { project, script } = generateProceduralMovieProject({ title: 'Auto', duration: 36, seed: 7 });
	const errors = validateProject(project);
	assert.deepEqual(errors, [], `schema violations:\n${errors.join('\n')}`);
	assert.ok(script.shots.length >= 1);
	assert.equal(project.duration, 36);
});

test('applyProceduralMovieToCinema wires into the cinema domain', () => {
	let appliedManifest = null;
	const cinema = {
		apply(manifest, options) {
			appliedManifest = { manifest, options };
			return { ok: true };
		}
	};
	const result = applyProceduralMovieToCinema(cinema, createDreamHangoutScript(), { label: 'test' });
	assert.equal(result.applied.ok, true);
	assert.equal(appliedManifest.manifest.title, 'Dream Hangout');
	assert.equal(appliedManifest.options.label, 'test');
	assert.equal(result.project.title, 'Dream Hangout');
	assert.throws(
		() => applyProceduralMovieToCinema(null, {}),
		/requires a live cinema domain/
	);
});

test('installProceduralMovieProject installs into a live session', () => {
	let installed = null;
	const session = {
		installProject(project, options) {
			installed = { project, options };
			return { ok: true };
		}
	};
	const { project } = generateProceduralMovieProject(createDreamHangoutScript());
	const receipt = installProceduralMovieProject(session, project);
	assert.equal(receipt.ok, true);
	assert.equal(installed.project.title, 'Dream Hangout');
	assert.equal(installed.options.reason, 'Procedural sequence generated');
	assert.throws(
		() => installProceduralMovieProject(null, project),
		/requires a live studio session/
	);
});

test('renderProceduralMovieProject degrades gracefully without MediaRecorder', async () => {
	const { project } = generateProceduralMovieProject(createDreamHangoutScript());
	const realMediaRecorder = globalThis.MediaRecorder;
	let played = false;
	const session = {
		director: { overlay: { canvas: {} }, project },
		play() { played = true; },
		render() { throw new Error('should not render without MediaRecorder'); }
	};
	try {
		delete globalThis.MediaRecorder;
		const receipt = await renderProceduralMovieProject(session, { download: false });
		assert.equal(receipt.recorded, false);
		assert.equal(receipt.reason, 'media-recorder-unavailable');
		assert.equal(receipt.fallback, 'live-preview');
		assert.equal(played, true);
	} finally {
		if (realMediaRecorder !== undefined) globalThis.MediaRecorder = realMediaRecorder;
	}
});
