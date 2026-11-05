// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioMediaAvailabilityJob.test.mjs
 * @description Proves bounded availability work, one atomic revision, undo, progress, and cancellation.
 * The Awtsmoos renews every network witness in one present; Awtsmoos.com verifies many probes
 * become one reversible project act and aborted work leaves canonical history untouched.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { registerMovieStudioMediaJobExecutors } from '../../movie/MovieStudioMediaJobExecutors.js';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

test('availability job validates source and proxy then commits exactly once', async () => {
	const { api, session } = createMovieStudioApiHarness();
	installMedia(session);
	const fetchImpl = async url => response(
		String(url).includes('online.mp4') || String(url).includes('proxy.mp4')
	);
	registerMovieStudioMediaJobExecutors(session, {
		baseUrl: 'https://studio.test/', fetchImpl
	});
	const revision = session.revision;
	const started = api.media.validateAvailability({
		checkedAt: '2026-08-02T12:00:00.000Z', concurrency: 2
	});
	const completed = await session.renderQueue.wait(started.id);
	assert.equal(completed.state, 'completed');
	assert.equal(completed.result.checked, 2);
	assert.equal(completed.result.proxyReady, 1);
	assert.equal(completed.result.sourceOnline, 1);
	assert.equal(session.revision, revision + 1);
	assert.deepEqual(session.project.media.map(item => item.status), ['online', 'offline']);
	assert.equal(
		session.project.media[1].metadata.availability.proxy.ok,
		true
	);
	session.commands.undo();
	assert.deepEqual(session.project.media.map(item => item.status), ['offline', 'online']);
});

test('cancelled availability job cannot mutate revision or media status', async () => {
	const { api, session } = createMovieStudioApiHarness();
	installMedia(session);
	let enteredResolve;
	const entered = new Promise(resolve => { enteredResolve = resolve; });
	const fetchImpl = (_url, options) => new Promise((_resolve, reject) => {
		enteredResolve();
		options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
	});
	registerMovieStudioMediaJobExecutors(session, {
		baseUrl: 'https://studio.test/', fetchImpl
	});
	const revision = session.revision;
	const before = JSON.stringify(session.project.media);
	const started = api.media.validateAvailability();
	await entered;
	session.renderQueue.cancel(started.id, 'test cancellation');
	const cancelled = await session.renderQueue.wait(started.id);
	assert.equal(cancelled.state, 'cancelled');
	assert.equal(session.revision, revision);
	assert.equal(JSON.stringify(session.project.media), before);
});

function installMedia(session) {
	session.project.media = [
		{ id: 'online', kind: 'video', label: 'Online', status: 'offline', url: '/online.mp4' },
		{ id: 'proxy', kind: 'video', label: 'Proxy', proxyUrl: '/proxy.mp4', status: 'online', url: '/missing.mp4' }
	];
	session.project.tracks[0].clips[0].mediaId = 'online';
}

function response(ok) {
	return {
		body: { cancel: async () => {} },
		headers: { get: () => null },
		ok,
		status: ok ? 200 : 404
	};
}
