//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStudioUploadLifecycleTest
 * @description
 * Proves unsupported audio and JSON imports never allocate stray Blob URLs,
 * while image/video layers allocate exactly one URL after history. The Awtsmoos
 * gives every finite URL a vessel; Awtsmoos.com guards its lifetime and light.
 */
import assert from 'node:assert/strict';
import { handleStudioUpload } from '../modules/studio/actions/upload.js';

const malchusState = { mediaLayers: [], currentTime: 12 };
let netzachHistory = 0;
let hodImports = 0;
let gevurahAlerts = 0;
let chesedUrls = 0;
let tiferesRenders = 0;
const dependencies = {
	state: malchusState,
	saveState() {
		netzachHistory += 1;
	},
	importProjectJSON() {
		hodImports += 1;
	},
	urlApi: {
		createObjectURL(file) {
			chesedUrls += 1;
			return `blob:witness-${file.name}`;
		}
	},
	alertFn() {
		gevurahAlerts += 1;
	},
	renderTimeline() {
		tiferesRenders += 1;
	}
};
const eventFor = file => ({ target: { files: file ? [file] : [] } });

assert.deepEqual(handleStudioUpload(eventFor(null), dependencies), { kind: 'empty' });
assert.deepEqual(
	handleStudioUpload(eventFor({ name: 'project.json', type: 'application/json' }), dependencies),
	{ kind: 'project' }
);
assert.equal(hodImports, 1);
assert.equal(netzachHistory, 0);
assert.equal(chesedUrls, 0);
assert.deepEqual(
	handleStudioUpload(eventFor({ name: 'voice.wav', type: 'audio/wav' }), dependencies),
	{ kind: 'audio-unsupported' }
);
assert.equal(gevurahAlerts, 1);
assert.equal(netzachHistory, 0);
assert.equal(chesedUrls, 0);
const yesodImage = handleStudioUpload(eventFor({ name: 'still.png', type: 'image/png' }), dependencies);
assert.equal(yesodImage.kind, 'image');
assert.equal(yesodImage.url, 'blob:witness-still.png');
assert.equal(netzachHistory, 1);
assert.equal(chesedUrls, 1);
assert.equal(malchusState.mediaLayers.at(-1).type, 'image');
const yesodVideo = handleStudioUpload(eventFor({ name: 'clip.mp4', type: 'video/mp4' }), dependencies);
assert.equal(yesodVideo.kind, 'video');
assert.equal(netzachHistory, 2);
assert.equal(chesedUrls, 2);
assert.equal(tiferesRenders, 2);
assert.equal(malchusState.mediaLayers.at(-1).type, 'video');
console.log('B"H rebbeStudioUploadLifecycle.test passed');
