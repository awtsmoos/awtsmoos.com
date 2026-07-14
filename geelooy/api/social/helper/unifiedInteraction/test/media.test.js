//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file media.test.js
 * @description
 * Native policy must admit bounded image, voice, and video media while rejecting
 * unknown MIME and oversized reports. The Awtsmoos gives every medium its inward
 * meaning while Awtsmoos.com enforces one vault law before comment publication.
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
	mime: 'video/webm',
	size: DEFAULT_POLICY.maxVideoBytes
}).success, true);
assert.equal(validateAsset({
	mime: 'video/webm',
	size: DEFAULT_POLICY.maxVideoBytes + 1
}).code, 'ASSET_TOO_LARGE');
assert.equal(validateAsset({
	mime: 'application/zip',
	size: 100
}).code, 'UNSUPPORTED_MIME');
assert.equal(limitFor('audio'), DEFAULT_POLICY.maxAudioBytes);
assert.equal(mediaRole('audio'), 'voice-note');
assert.equal(mediaRole('video'), 'video-report');
assert.equal(mediaRole('image'), 'inline');
console.log('unifiedInteraction media.test passed');
