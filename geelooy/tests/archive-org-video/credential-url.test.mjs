//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { ArchiveOrgCredentialVault } from '../../shared/storage/archiveOrg/ArchiveOrgCredentialVault.js';
import {
	archivePublicFileUrl,
	archiveUploadUrl,
	isArchivePublicFileUrl
} from '../../shared/storage/archiveOrg/ArchiveOrgUrls.js';
import { archiveFilenameFor, archiveIdentifierFor } from '../../shared/storage/archiveOrg/ArchiveOrgIdentity.js';
import { archiveUploadHeaders } from '../../shared/storage/archiveOrg/ArchiveOrgHeaders.js';

class MemoryStorage {
	constructor() {
		this.values = new Map();
	}

	getItem(key) {
		return this.values.get(key) || null;
	}

	setItem(key, value) {
		this.values.set(key, value);
	}

	removeItem(key) {
		this.values.delete(key);
	}
}

test('credential vault defaults to session and forgets every local vessel', () => {
	const sessionStorage = new MemoryStorage();
	const localStorage = new MemoryStorage();
	const vault = new ArchiveOrgCredentialVault({ sessionStorage, localStorage });
	vault.save({ accessKey: 'ACCESS1234', secretKey: 'SECRET5678' });
	assert.equal(vault.load().persistence, 'session');
	assert.equal(vault.describe().accessKeyMask, '••••1234');
	assert.equal(localStorage.values.size, 0);
	vault.save({ accessKey: 'DEVICE4321', secretKey: 'LOCAL8765' }, true);
	assert.equal(vault.load().persistence, 'device');
	assert.equal(sessionStorage.values.size, 0);
	vault.forget();
	assert.equal(vault.load(), null);
});

test('Archive.org URLs are canonical and hostile alternatives are rejected', () => {
	const publicUrl = archivePublicFileUrl('awtsmoos-item', 'my video.mp4');
	assert.equal(isArchivePublicFileUrl(publicUrl), true);
	assert.match(archiveUploadUrl('awtsmoos-item', 'my video.mp4'), /^https:\/\/s3\.us\.archive\.org\//);
	for (const value of [
		'http://archive.org/download/a/b.mp4',
		'https://evil.example/download/a/b.mp4',
		'https://archive.org:444/download/a/b.mp4',
		'https://user:pass@archive.org/download/a/b.mp4',
		'https://archive.org/download/a/b.mp4?secret=x',
		'https://archive.org/download/a/b.mp4#x',
		'https://archive.org/download/%2e%2e/b.mp4',
		'https://archive.org/details/a'
	]) {
		assert.equal(isArchivePublicFileUrl(value), false, value);
	}
});

test('identity and upload headers are bounded while Authorization stays local to IAS3 construction', () => {
	const item = { provider: 'youtube', sourceId: 'abc', title: 'My Great Video!' };
	const identifier = archiveIdentifierFor(item, 'folder/video.mp4');
	const filename = archiveFilenameFor({ name: '../Bad Video.MP4' }, 'folder/video.mp4');
	assert.match(identifier, /^awtsmoos-my-great-video-[a-z0-9]+$/);
	assert.equal(filename.includes('/'), false);
	const headers = archiveUploadHeaders({
		credentials: { accessKey: 'AK', secretKey: 'SK' },
		file: { type: 'video/mp4', size: 42 },
		metadata: { title: 'hello\r\ninjected: no' }
	});
	assert.equal(headers.Authorization, 'LOW AK:SK');
	assert.equal(headers['x-archive-meta-mediatype'], 'movies');
	assert.equal(headers['x-archive-meta-title'].includes('\n'), false);
});
