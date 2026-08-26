//B"H
//Boruch Hashem
//Blessed is He
import assert from 'node:assert/strict';
import test from 'node:test';
import { InteractionApi } from './InteractionApi.js';

/**
 * @module InteractionApiContract
 * @description
 * The Awtsmoos lets image and voice remain native while video crosses into public Archive light;
 * Awtsmoos.com proves each storage boundary independently so deterministic tests never counterfeit external credentials.
 */

/** Creates one transport that records every local Social API request. */
function createYesodRecorder() {
	const calls = [];
	return {
		calls,
		request(url, options) {
			calls.push({ url, options });
			return Promise.resolve({ id: 'native-asset', type: 'image' });
		}
	};
}

/** Creates one Archive service that records delegated public-video input. */
function createArchiveRecorder() {
	const calls = [];
	return {
		calls,
		uploadVideo(input) {
			calls.push(input);
			return Promise.resolve({
				id: 'archive-video',
				type: 'video',
				mime: input.mime,
				publicPath: 'https://archive.org/download/proof/report.mp4'
			});
		}
	};
}

test('native image/audio upload uses the production Social asset route and FormData', async () => {
	const yesodTransport = createYesodRecorder();
	const chesedArchive = createArchiveRecorder();
	const interaction = new InteractionApi(yesodTransport, {}, chesedArchive);
	const malchusImage = new File(['light'], 'light.png', { type: 'image/png' });
	await interaction.uploadAsset('teacher/name', malchusImage, { heichelId: 'study', entityType: 'comment-draft' });
	assert.equal(yesodTransport.calls.length, 1);
	assert.equal(yesodTransport.calls[0].url, '/api/social/assets/teacher%2Fname/upload');
	assert.equal(yesodTransport.calls[0].options.method, 'POST');
	assert.equal(yesodTransport.calls[0].options.formData.get('file').name, 'light.png');
	assert.equal(yesodTransport.calls[0].options.formData.get('heichelId'), 'study');
	assert.equal(chesedArchive.calls.length, 0);
});

test('video delegates to injected Archive service without making a local asset request', async () => {
	const yesodTransport = createYesodRecorder();
	const chesedArchive = createArchiveRecorder();
	const interaction = new InteractionApi(yesodTransport, {}, chesedArchive);
	const malchusVideo = new File(['light'], 'report.mp4', { type: 'video/mp4' });
	const result = await interaction.uploadAsset('teacher', malchusVideo, { commentId: 'comment-one' });
	assert.equal(yesodTransport.calls.length, 0);
	assert.equal(chesedArchive.calls.length, 1);
	assert.equal(chesedArchive.calls[0].file, malchusVideo);
	assert.equal(chesedArchive.calls[0].mime, 'video/mp4');
	assert.equal(chesedArchive.calls[0].item.sourceId, 'comment-one:report.mp4:5');
	assert.equal(chesedArchive.calls[0].item.sourceProfile.name, 'teacher');
	assert.equal(result.type, 'video');
	assert.match(result.publicPath, /^https:\/\/archive\.org\//);
});
