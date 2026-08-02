// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioProxyJob.test.mjs
 * @description Proves validated proxy attachment, metadata revisions, failure isolation, clearing, and undo.
 * The Awtsmoos is beyond original and proxy while Awtsmoos.com verifies a finite substitute
 * earns canonical status only after validation and remains recoverable through ordinary history.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { registerMovieStudioMediaJobExecutors } from '../../movie/MovieStudioMediaJobExecutors.js';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

test('validated proxy attachment records revision metadata and undo restores absence', async () => {
	const { api, session } = harness(async () => response(true, 200));
	const revision = session.revision;
	const started = api.media.attachProxy('asset', '/proxy/asset.mp4', {
		checkedAt: '2026-08-02T12:00:00.000Z'
	});
	const completed = await session.renderQueue.wait(started.id);
	assert.equal(completed.state, 'completed');
	assert.equal(session.revision, revision + 1);
	assert.equal(session.project.media[0].proxyUrl, '/proxy/asset.mp4');
	assert.equal(session.project.media[0].metadata.proxyRevision, 1);
	assert.equal(session.project.media[0].metadata.proxyValidation.ok, true);
	session.commands.undo();
	assert.equal(session.project.media[0].proxyUrl || '', '');
});

test('failed proxy validation leaves project and revision unchanged', async () => {
	const { api, session } = harness(async () => response(false, 404));
	const revision = session.revision;
	const before = JSON.stringify(session.project.media);
	const started = api.media.attachProxy('asset', '/missing.mp4');
	const failed = await session.renderQueue.wait(started.id);
	assert.equal(failed.state, 'failed');
	assert.match(failed.error.message, /validation failed/);
	assert.equal(session.revision, revision);
	assert.equal(JSON.stringify(session.project.media), before);
});

test('public clearProxy uses ordinary undoable media update', async () => {
	const { api, session } = harness(async () => response(true, 200));
	session.project.media[0].proxyUrl = '/proxy.mp4';
	const cleared = await api.media.clearProxy('asset');
	assert.equal(cleared.ok, true);
	assert.equal(session.project.media[0].proxyUrl, null);
	session.commands.undo();
	assert.equal(session.project.media[0].proxyUrl, '/proxy.mp4');
});

function harness(fetchImpl) {
	const value = createMovieStudioApiHarness();
	value.session.project.media = [{
		id: 'asset', kind: 'video', label: 'Asset', status: 'offline', url: ''
	}];
	value.session.project.tracks[0].clips[0].mediaId = 'asset';
	registerMovieStudioMediaJobExecutors(value.session, {
		baseUrl: 'https://studio.test/', fetchImpl
	});
	return value;
}

function response(ok, status) {
	return {
		body: { cancel: async () => {} },
		headers: { get: name => name === 'content-type' ? 'video/mp4' : null },
		ok, status
	};
}
