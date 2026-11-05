// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectRecorder.test.mjs
 * @description Proves recorder identity follows director identity and active capture cannot be replaced underneath itself.
 * The Awtsmoos renews every capture vessel with its director; Awtsmoos.com tests that former sound is released and present truth stays bound.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { replaceMovieProjectRecorder } from '../movie/MovieProjectRecorder.js';

class RecorderFixture {
	constructor(director) {
		this.director = director;
		this.project = director.project;
		this.recording = false;
		this.audio = { async stop() {} };
	}
}

test('binds a recorder to the exact current director and project', () => {
	const session = {};
	const director = { project: { title: 'Current' } };
	const recorder = replaceMovieProjectRecorder(session, director, { RecorderClass: RecorderFixture });
	assert.equal(session.recorder, recorder);
	assert.equal(recorder.director, director);
	assert.equal(recorder.project, director.project);
});

test('replaces a retired recorder and refuses replacement during active recording', async () => {
	let stopped = 0;
	const previous = {
		audio: { async stop() { stopped += 1; } },
		recording: false
	};
	const session = { recorder: previous };
	replaceMovieProjectRecorder(session, { project: {} }, { RecorderClass: RecorderFixture });
	await new Promise(resolve => setTimeout(resolve, 0));
	assert.equal(stopped, 1);
	session.recorder.recording = true;
	assert.throws(
		() => replaceMovieProjectRecorder(session, { project: {} }, { RecorderClass: RecorderFixture }),
		/while a live render is recording/
	);
});
