//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const policy = require('../../api/social/helper/assets/assetPolicy.js');
const archive = require('../../api/social/helper/migrations/ArchiveOrgPublicAsset.js');
const metaAsset = require('../../api/social/helper/migrations/meta/MetaAssetGuard.js');
const secret = require('../../api/social/helper/migrations/meta/SecretFieldGuard.js');
const youtubeGuard = require('../../api/social/helper/migrations/youtube/ManifestGuard.js');
const youtubePlan = require('../../api/social/helper/migrations/youtube/YouTubeMigrationPlan.js');

const goodUrl = 'https://archive.org/download/awtsmoos-item/video.mp4';

test('native asset policy refuses video before storage', () => {
	const result = policy.validateAsset({ mime: 'video/mp4', size: 1 });
	assert.equal(result.error, true);
	assert.equal(result.code, 'VIDEO_EXTERNAL_STORAGE_REQUIRED');
	assert.equal(result.serverReceivesCredentials, false);
	assert.equal(policy.validateAsset({ mime: 'image/png', size: 1 }).success, true);
});

test('migration remote asset gate accepts only canonical Archive.org video', () => {
	assert.equal(archive.isArchiveOrgPublicPath(goodUrl), true);
	assert.equal(archive.isArchiveOrgPublicPath('https://example.com/video.mp4'), false);
	assert.deepEqual(metaAsset.validatePublicAsset({
		type: 'video',
		mime: 'video/mp4',
		publicPath: goodUrl
	}, 0, 0), []);
	assert.equal(metaAsset.validatePublicAsset({
		type: 'video',
		publicPath: '/api/social/assets/a/video/x.mp4'
	}, 0, 0)[0].code, 'VIDEO_REQUIRES_ARCHIVE');
	assert.equal(metaAsset.validatePublicAsset({
		type: 'image',
		publicPath: goodUrl
	}, 0, 0)[0].code, 'ARCHIVE_VIDEO_ONLY');
});

test('secret-shaped fields are recursively rejected', () => {
	assert.equal(secret.hasSecretField({ nested: { secretKey: 'x' } }), true);
	assert.equal(secret.hasSecretField({ archive: { mediaUrl: goodUrl } }), false);
	const manifest = {
		aliasId: 'a',
		heichelId: 'h',
		fallbackSeriesId: 's',
		items: [{ id: 'v', archive: { mediaUrl: goodUrl } }]
	};
	assert.equal(youtubeGuard.guardManifest(manifest).valid, true);
	assert.equal(youtubeGuard.guardManifest({
		...manifest,
		secretKey: 'never'
	}).valid, false);
});

test('YouTube chronology preserves Unknown and plans canonical public video', () => {
	assert.deepEqual(youtubePlan.chronology({ publishedAt: '' }), {
		year: 'Unknown',
		month: 'Unknown'
	});
	const manifest = {
		aliasId: 'a',
		heichelId: 'h',
		fallbackSeriesId: 's',
		playlistSeriesMap: {},
		items: [{
			id: 'v1',
			title: 'Video',
			description: '',
			publishedAt: '',
			playlistMemberships: [],
			archive: { mediaUrl: goodUrl }
		}]
	};
	const plan = youtubePlan.buildMigrationPlan(manifest);
	assert.equal(plan.entries[0].contentPayload.rootAssets[0].url, goodUrl);
	assert.equal(plan.years['Unknown-Unknown'], 1);
});
