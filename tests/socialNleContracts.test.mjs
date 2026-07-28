// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialNleContractsTest
 * @description
 * The Awtsmoos guards an immediate responsive NLE, real browser recorder, proven
 * parent-realm iframe capture, optional 3D host, and generated asset system.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('main studio boots the project-first NLE rather than the heavy world', () => {
	const boot = read('geelooy/social-composer/reel-studio/boot.js');
	assert.ok(boot.includes("import { NleApp } from './nle/NleApp.js'"));
	assert.ok(boot.includes('await NleApp.create(document)'));
	assert.ok(!boot.includes('bootMitzvahWorldPage.js'));
	assert.ok(!boot.includes('createMovieStudio'));
});

test('NLE publishes the public recorder API expected by the social bridge', () => {
	const api = read('geelooy/social-composer/reel-studio/nle/NlePublicApi.js');
	const recorder = read('geelooy/social-composer/reel-studio/nle/NleMovieRecorder.js');
	const capture = read('geelooy/social-composer/reel-studio/nle/NleCaptureStream.js');
	assert.ok(api.includes('globalThis.AwtsmoosMovie'));
	assert.ok(api.includes('recorder: app.recorder'));
	assert.ok(api.includes("kind: 'social-nle'"));
	assert.ok(recorder.includes('createNleCaptureStream('));
	assert.ok(recorder.includes('new MediaRecorder('));
	assert.ok(capture.includes('canvas.captureStream(0)'));
	assert.ok(capture.includes('requestFrame'));
});

test('parent bridge owns embedded NLE recording while native studios stay native', () => {
	const renderer = read('geelooy/social-composer/js/reel/ReelMovieRenderer.js');
	const parent = read('geelooy/social-composer/js/reel/ReelParentNleRecorder.js');
	assert.ok(renderer.includes("studio.runtime?.kind === 'social-nle'"));
	assert.ok(renderer.includes('renderParentNleMovie(studio, options)'));
	assert.ok(renderer.includes('studio.recorder.render('));
	assert.ok(parent.includes('createParentNleCapture('));
	assert.ok(parent.includes('new Blob(recording.chunks'));
});

test('optional world host alone imports the current full movie studio', () => {
	const world = read('geelooy/social-composer/reel-studio/world-boot.js');
	assert.ok(world.includes('/games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieStudio.js'));
	assert.ok(world.includes('createMovieStudio({ hosts, project })'));
	assert.ok(world.includes('readNleWorldProject()'));
});

test('responsive shell contains all NLE panes and persistent timeline', () => {
	const shell = read('geelooy/social-composer/reel-studio/nle/NleShell.js');
	for (const token of [
		'data-nle-panel="assets"',
		'data-nle-panel="preview"',
		'data-nle-panel="inspector"',
		'data-nle-timeline',
		'data-nle-render',
		'data-nle-world'
	]) assert.ok(shell.includes(token), token);
	const mobile = read('geelooy/social-composer/reel-studio/nle/styles/mobile-workspace.css');
	assert.ok(mobile.includes('[data-mobile-panel="assets"]'));
	assert.ok(mobile.includes('[data-mobile-panel="inspector"]'));
});

test('every NLE source and stylesheet remains under the hard ceiling', () => {
	for (const folder of [
		'geelooy/social-composer/reel-studio/nle',
		'geelooy/social-composer/reel-studio/nle/styles'
	]) {
		for (const name of fs.readdirSync(path.join(root, folder))) {
			if (!/\.(js|css)$/.test(name)) continue;
			const lines = read(`${folder}/${name}`).split('\n').length;
			assert.ok(lines <= 121, `${name}: ${lines}`);
		}
	}
});
