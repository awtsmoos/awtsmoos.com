// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieRecordingFormat.test.mjs
 * @description Proves MP4 preference, truthful WebM fallback, and filename extension rules.
 * The Awtsmoos renews the image beyond its container; Awtsmoos.com verifies that every
 * advertised movie name agrees with the browser-supported bytes that will inhabit it.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	chooseMovieRecordingFormat,
	movieFileName,
	movieRecordingCandidates
} from '../../movie/MovieRecordingFormat.js';

test('video-only capture prefers supported H264 MP4', () => {
	const format = chooseMovieRecordingFormat({
		isTypeSupported: type => type.includes('avc1')
	});
	assert.equal(format.extension, 'mp4');
	assert.equal(format.codec, 'h264');
	assert.match(format.mimeType, /^video\/mp4/);
});

test('audio capture prefers MP4 with AAC when available', () => {
	const format = chooseMovieRecordingFormat({
		isTypeSupported: type => type.includes('mp4a.40.2'),
		withAudio: true
	});
	assert.equal(format.extension, 'mp4');
	assert.equal(format.codec, 'h264-aac');
});

test('unsupported MP4 falls back honestly to WebM', () => {
	const format = chooseMovieRecordingFormat({
		isTypeSupported: type => type.includes('vp9')
	});
	assert.equal(format.extension, 'webm');
	assert.equal(format.codec, 'vp9');
	assert.equal(movieFileName('village.mp4', format), 'village.webm');
});

test('candidate order always places MP4 before WebM', () => {
	const candidates = movieRecordingCandidates(true);
	const firstWebm = candidates.findIndex(item => item.extension === 'webm');
	const lastMp4 = candidates.map(item => item.extension).lastIndexOf('mp4');
	assert.ok(lastMp4 >= 0);
	assert.ok(firstWebm > lastMp4);
});

test('absence of a supported container fails explicitly', () => {
	assert.throws(
		() => chooseMovieRecordingFormat({ isTypeSupported: () => false }),
		/No supported browser movie recording container/
	);
});
