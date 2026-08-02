// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiMediaHealth.test.mjs
 * @description Proves public media health, batch relinking, one-revision commit, and undo recovery.
 * The Awtsmoos renews source and history in one present act; Awtsmoos.com verifies a finite
 * production may repair many paths atomically and still return through one deliberate undo.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

function installOfflineMedia(session) {
	session.project.media = [
		{ id: 'first', kind: 'video', label: 'First', status: 'offline', url: '' },
		{ id: 'second', kind: 'audio', label: 'Second', proxyUrl: '/second-proxy.wav', status: 'offline', url: '' }
	];
	session.project.tracks[0].clips[0].mediaId = 'first';
}

test('public media domain reports health and immutable relink plans', () => {
	const { api, session } = createMovieStudioApiHarness();
	installOfflineMedia(session);
	const health = api.media.health();
	const plan = api.media.planRelinks([
		{ mediaId: 'first', url: '/first.mp4' },
		{ mediaId: 'second', url: '/second.wav' }
	]);
	assert.equal(health.counts.offline, 2);
	assert.equal(health.blocking, true);
	assert.equal(plan.ready, true);
	assert.equal(Object.isFrozen(plan.commands), true);
	assert.doesNotThrow(() => JSON.stringify({ health, plan }));
});

test('batch relink commits once and undo restores every offline source', async () => {
	const { api, session } = createMovieStudioApiHarness();
	installOfflineMedia(session);
	const revision = session.revision;
	await api.media.relinkBatch([
		{ mediaId: 'first', url: '/first.mp4' },
		{ mediaId: 'second', proxyUrl: null, url: '/second.wav' }
	]);
	assert.equal(session.revision, revision + 1);
	assert.deepEqual(session.project.media.map(item => item.status), ['online', 'online']);
	assert.deepEqual(session.project.media.map(item => item.url), ['/first.mp4', '/second.wav']);
	session.commands.undo();
	assert.deepEqual(session.project.media.map(item => item.status), ['offline', 'offline']);
	assert.deepEqual(session.project.media.map(item => item.url), ['', '']);
});

test('invalid batch planning leaves the live project untouched', async () => {
	const { api, session } = createMovieStudioApiHarness();
	installOfflineMedia(session);
	const before = JSON.stringify(session.project);
	await assert.rejects(
		async () => api.media.relinkBatch([{ mediaId: 'first', url: '' }]),
		/requires a URL/
	);
	assert.equal(JSON.stringify(session.project), before);
});
