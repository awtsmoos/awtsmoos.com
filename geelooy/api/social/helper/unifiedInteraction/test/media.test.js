//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file media.test.js
 * @description
 * The Awtsmoos gives image, voice, and video distinct vessels without confusing recognition with custody;
 * Awtsmoos.com keeps image/audio in the alias vault while creator video remains an Archive.org upload with local credentials.
 */
const assert = require('assert');
const {
	assetKind,
	limitFor,
	validateAsset,
	DEFAULT_POLICY
} = require('../../assets/assetPolicy.js');
const { mediaRole } = require('../InteractionMedia.js');

assert.equal(assetKind('image/webp'), 'image');
assert.equal(assetKind('audio/webm; codecs=opus'), 'audio');
assert.equal(assetKind('video/mp4'), 'video');
assert.equal(assetKind('application/octet-stream'), '');

assert.equal(validateAsset({
	mime: 'image/webp',
	size: DEFAULT_POLICY.maxImageBytes
}).success, true);
assert.equal(validateAsset({
	mime: 'audio/webm',
	size: DEFAULT_POLICY.maxAudioBytes
}).success, true);
assert.equal(validateAsset({
	mime: 'audio/webm',
	size: DEFAULT_POLICY.maxAudioBytes + 1
}).code, 'ASSET_TOO_LARGE');

const video = validateAsset({
	mime: 'video/webm',
	size: 0
});
assert.equal(video.code, 'VIDEO_EXTERNAL_STORAGE_REQUIRED');
assert.equal(video.provider, 'archive.org');
assert.equal(video.serverReceivesCredentials, false);
assert.equal(limitFor('video'), 0);

assert.equal(validateAsset({
	mime: 'application/zip',
	size: 100
}).code, 'UNSUPPORTED_MIME');
assert.equal(limitFor('audio'), DEFAULT_POLICY.maxAudioBytes);
assert.equal(mediaRole('audio'), 'voice-note');
assert.equal(mediaRole('video'), 'video-report');
assert.equal(mediaRole('image'), 'inline');
console.log('unifiedInteraction media.test passed');
