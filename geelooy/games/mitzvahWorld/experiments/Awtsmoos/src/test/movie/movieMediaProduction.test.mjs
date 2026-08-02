// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieMediaProduction.test.mjs
 * @description Proves production health, preflight, collection, ranked suggestions, and API exposure.
 * The Awtsmoos is beyond source and delivery; Awtsmoos.com verifies every finite dependency
 * becomes immutable evidence before render, collection, relink, or proxy recovery begins.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieMediaCollectionManifest } from '../../movie/MovieMediaCollectionManifest.js';
import { createMovieMediaHealthReport } from '../../movie/MovieMediaHealth.js';
import { suggestMovieMediaRelinks } from '../../movie/MovieMediaRelinkSuggestions.js';
import { createMovieProjectPreflight } from '../../movie/MovieProjectPreflight.js';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

test('health distinguishes source-online, proxy-ready, fully-offline, and unused assets', () => {
	const report = createMovieMediaHealthReport(project());
	assert.deepEqual(report.productionCounts, {
		fullyOffline: 2,
		proxyReady: 1,
		referenced: 3,
		referencedFullyOffline: 1,
		sourceOnline: 1,
		unused: 1
	});
	assert.equal(report.deliveryBlocking, true);
	assert.equal(report.items.find(item => item.id === 'proxy').availability, 'proxy-ready');
	assert.equal(Object.isFrozen(report.productionCounts), true);
});

test('preflight blocks unresolved production dependencies and grades repaired project', () => {
	const blocked = createMovieProjectPreflight(project());
	assert.equal(blocked.ready, false);
	assert.equal(blocked.grade, 'blocked');
	assert.deepEqual(
		blocked.blockers.map(item => item.code),
		['DANGLING_MEDIA_REFERENCES', 'REFERENCED_MEDIA_OFFLINE']
	);
	const repaired = project();
	repaired.media.find(item => item.id === 'missing-source').proxyUrl = '/proxy/missing.mp4';
	repaired.tracks[0].clips.pop();
	const warning = createMovieProjectPreflight(repaired);
	assert.equal(warning.ready, true);
	assert.equal(warning.grade, 'warning');
	assert.equal(Object.isFrozen(warning), true);
});

test('collection and suggestions remain deterministic and non-mutating', () => {
	const source = project();
	const before = JSON.stringify(source);
	const manifest = createMovieMediaCollectionManifest(source, { referencedOnly: true });
	assert.equal(manifest.counts.total, 3);
	assert.equal(manifest.items.some(item => item.id === 'unused'), false);
	const suggestions = suggestMovieMediaRelinks(source, [
		'/relink/missing-source.mov',
		'/relink/missing-source.mp4',
		'/relink/other.mp4'
	]);
	assert.equal(suggestions.find(item => item.mediaId === 'missing-source').matches[0].score, 100);
	assert.equal(JSON.stringify(source), before);
	assert.equal(Object.isFrozen(manifest.items), true);
});

test('stable media and project APIs expose frozen production contracts', () => {
	const { api, session } = createMovieStudioApiHarness();
	session.project = project();
	for (const name of ['attachProxy', 'collection', 'preflight', 'suggestRelinks', 'validateAvailability']) {
		assert.equal(typeof api.media[name], 'function');
	}
	assert.equal(typeof api.project.preflight, 'function');
	assert.equal(Object.isFrozen(api.media.collection()), true);
	assert.equal(api.project.preflight().grade, 'blocked');
});

function project() {
	return {
		duration: 20, fps: 24, resolution: { height: 1080, width: 1920 }, title: 'Production',
		media: [
			media('online', 'online', '/source/online.mp4'),
			{ ...media('proxy', 'offline', ''), proxyUrl: '/proxy/proxy.mp4' },
			media('missing-source', 'offline', ''),
			media('unused', 'offline', '')
		],
		tracks: [{ clips: [
			{ duration: 4, id: 'one', mediaId: 'online', start: 0 },
			{ duration: 4, id: 'two', mediaId: 'proxy', start: 4 },
			{ duration: 4, id: 'three', mediaId: 'missing-source', start: 8 },
			{ duration: 1, id: 'dangling', sourceMediaId: 'unknown', start: 12 }
		], id: 'video', type: 'video' }],
		version: 1
	};
}

function media(id, status, url) {
	return { id, kind: 'video', label: `${id}.mp4`, status, url };
}
