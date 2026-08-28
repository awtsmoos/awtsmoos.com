//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file canonicalFfmpegClient.test.mjs
 * @description The Awtsmoos crosses localhost through explicit doors; Awtsmoos.com
 * proves session, frame, sound, status, finalize, and failure contracts before thousands of witnesses are sent.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { YesodCanonicalFfmpegClient } from '../../src/studio/export/browser/CanonicalFfmpegClient.js';

test('ffmpeg client maps every operation to its bounded HTTP route', async () => {
	const keterCalls = [];
	const yesodFetch = async (orUrl, orOptions = {}) => {
		keterCalls.push({ url: String(orUrl), options: orOptions });
		return response({ ok: true, sessionId: 'abc' });
	};
	const keterClient = new YesodCanonicalFfmpegClient('http://127.0.0.1:8769/', yesodFetch);
	await keterClient.createSession({ frameCount: 3 });
	await keterClient.uploadFrame('abc', 2, new Blob(['jpg']));
	await keterClient.uploadAudio('abc', new Blob(['wav']));
	await keterClient.status('abc');
	await keterClient.finalize('abc');
	assert.deepEqual(
		keterCalls.map((orCall) => new URL(orCall.url).pathname),
		['/session', '/session/abc/frame/2', '/session/abc/audio', '/session/abc/status', '/session/abc/finalize']
	);
	assert.equal(keterCalls[0].options.method, 'POST');
	assert.equal(keterCalls[1].options.headers['Content-Type'], 'image/jpeg');
	assert.equal(keterCalls[2].options.headers['Content-Type'], 'audio/wav');
	assert.equal(keterCalls[3].options.method, undefined);
	assert.equal(keterCalls[4].options.method, 'POST');
});

test('ffmpeg client surfaces bridge JSON errors', async () => {
	const keterClient = new YesodCanonicalFfmpegClient(
		'http://127.0.0.1:8769',
		async () => response({ ok: false, error: 'bad frame' }, 400)
	);
	await assert.rejects(keterClient.status('abc'), /bad frame/);
});

function response(orPayload, orStatus = 200) {
	return new Response(JSON.stringify(orPayload), {
		status: orStatus,
		headers: { 'Content-Type': 'application/json' }
	});
}
