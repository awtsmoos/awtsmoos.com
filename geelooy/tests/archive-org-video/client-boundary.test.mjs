//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

function source(relative) {
	return fs.readFileSync(path.join(root, relative), 'utf8');
}

test('every known video-capable social client routes video through Archive.org', () => {
	const clients = [
		'social-composer/js/media/MediaUploader.js',
		'scripts/awtsmoos/social/media/assetUploader.js',
		'comment-thread/modules/AssetVaultClient.js',
		'social-hub/js/api/InteractionApi.js',
		'social/migrate/js/upload/SelectedMediaUploadCoordinator.js'
	];
	for (const relative of clients) {
		const text = source(relative);
		assert.match(text, /ArchiveOrg|archive/i, relative);
	}
	assert.match(source('api/social/helper/assets/assetPolicy.js'), /VIDEO_EXTERNAL_STORAGE_REQUIRED/);
});

test('Social Hub native uploads use the canonical asset route', () => {
	const text = source('social-hub/js/api/InteractionApi.js');
	assert.match(text, /\$\{API\}\/assets\/\$\{encodeURIComponent\(aliasId\)\}\/upload/);
	assert.doesNotMatch(text, /\/aliases\/\$\{encodeURIComponent\(aliasId\)\}\/assets\/upload/);
});

test('IA-S3 Authorization is constructed only inside the Archive.org provider', () => {
	const publicClients = [
		'social-composer/js/media/MediaUploader.js',
		'scripts/awtsmoos/social/media/assetUploader.js',
		'comment-thread/modules/AssetVaultClient.js',
		'social-hub/js/api/InteractionApi.js',
		'social/migrate/js/publish/ManifestBuilder.js',
		'youtube/migrate/js/YouTubeMigrationApi.js'
	];
	for (const relative of publicClients) {
		assert.doesNotMatch(source(relative), /Authorization\s*:/, relative);
	}
	assert.match(source('shared/storage/archiveOrg/ArchiveOrgHeaders.js'), /Authorization:/);
});

test('documentation exposes local-key setup and direct-video boundary', () => {
	const docs = [
		'social/migrate/DOCUMENTATION.md',
		'social/migrate/API.md',
		'youtube/DOCUMENTATION.md'
	].map(source).join('\n');
	assert.match(docs, /https:\/\/archive\.org\/account\/s3\.php/);
	assert.match(docs, /https:\/\/archive\.org\/developers\/ias3\.html/);
	assert.match(docs, /direct/i);
});
