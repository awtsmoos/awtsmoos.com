// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieMediaHealth.test.mjs
 * @description Proves offline, proxy-only, dangling-reference, and deterministic relink planning.
 * The Awtsmoos knows every source before location is named; Awtsmoos.com verifies broken
 * finite paths become explicit immutable evidence rather than hidden delivery surprises.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieMediaHealthReport, planMovieMediaRelinks } from '../../movie/MovieMediaHealth.js';

function project() {
	return {
		media: [
			{ id: 'online', kind: 'video', label: 'Online', status: 'online', url: '/online.mp4' },
			{ id: 'offline', kind: 'video', label: 'Offline', proxyUrl: '/proxy.mp4', status: 'offline', url: '' },
			{ id: 'unused', kind: 'audio', label: 'Unused', status: 'offline', url: '' }
		],
		tracks: [{
			clips: [
				{ id: 'clip-online', mediaId: 'online' },
				{ id: 'clip-offline', mediaId: 'offline' },
				{ id: 'clip-missing', sourceMediaId: 'missing' }
			],
			id: 'video'
		}]
	};
}

test('health report identifies blocking offline and dangling references', () => {
	const report = createMovieMediaHealthReport(project());
	assert.equal(report.blocking, true);
	assert.deepEqual(report.counts, {
		danglingReferences: 1,
		offline: 2,
		online: 1,
		proxyOnly: 1,
		total: 3
	});
	assert.deepEqual(report.danglingReferences[0], {
		clipId: 'clip-missing',
		field: 'sourceMediaId',
		mediaId: 'missing',
		trackId: 'video'
	});
	assert.equal(Object.isFrozen(report.items), true);
});

test('relink plan is deterministic and lists unresolved offline media', () => {
	const plan = planMovieMediaRelinks(project(), [{ mediaId: 'offline', url: '/restored.mp4' }]);
	assert.equal(plan.ready, false);
	assert.deepEqual(plan.unresolved, ['unused']);
	assert.deepEqual(plan.commands[0], {
		payload: { mediaId: 'offline', proxyUrl: '/proxy.mp4', url: '/restored.mp4' },
		type: 'media.relink'
	});
	assert.equal(Object.isFrozen(plan.commands), true);
});

test('relink plan rejects unknown, duplicate, and empty candidates', () => {
	assert.throws(() => planMovieMediaRelinks(project(), [{ mediaId: 'missing', url: '/x' }]), /not found/);
	assert.throws(() => planMovieMediaRelinks(project(), [
		{ mediaId: 'offline', url: '/one' },
		{ mediaId: 'offline', url: '/two' }
	]), /Duplicate relink/);
	assert.throws(() => planMovieMediaRelinks(project(), [{ mediaId: 'offline', url: '' }]), /requires a URL/);
});
