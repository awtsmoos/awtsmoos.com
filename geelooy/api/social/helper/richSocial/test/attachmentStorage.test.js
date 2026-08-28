//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file attachmentStorage.test.js
 * @description
 * The Awtsmoos gives public recovery evidence a measured server-side vessel while every undeclared secret is refused;
 * Awtsmoos.com proves storage provenance can survive normalization without weakening the older attachment covenant.
 */

const assert = require('node:assert/strict');
const {
	normalizeAttachmentStorage
} = require('../AttachmentStorageSchema.js');
const {
	normalizeAttachment
} = require('../AttachmentSchema.js');

const normalizedStorage = normalizeAttachmentStorage({
	provider: 'archive.org',
	externalId: 'awtsmoos-video',
	filename: 'video.mp4',
	detailsUrl: 'https://archive.org/details/awtsmoos-video',
	historyUrl: 'http://archive.org/history/awtsmoos-video',
	fingerprint: 'sha256:bounded-light',
	state: 'verified',
	uploadedAt: '2026-08-28T06:00:00.000Z',
	verifiedAt: '2026-08-28T06:01:00.000Z',
	etag: 'public-etag',
	accessKey: 'must-disappear',
	secretKey: 'must-disappear',
	unknownMatter: 'must-disappear'
});

assert.equal(normalizedStorage.provider, 'archive.org');
assert.equal(normalizedStorage.externalId, 'awtsmoos-video');
assert.equal(normalizedStorage.detailsUrl, 'https://archive.org/details/awtsmoos-video');
assert.equal(normalizedStorage.historyUrl, '');
assert(!Object.hasOwn(normalizedStorage, 'accessKey'));
assert(!Object.hasOwn(normalizedStorage, 'secretKey'));
assert(!Object.hasOwn(normalizedStorage, 'unknownMatter'));

const normalizedAttachment = normalizeAttachment({
	id: 'archive:awtsmoos-video:hash',
	type: 'video',
	mime: 'video/mp4',
	publicPath: 'https://archive.org/download/awtsmoos-video/video.mp4',
	size: 4321,
	storage: normalizedStorage
});

assert.equal(normalizedAttachment.size, 4321);
assert.equal(normalizedAttachment.storage.provider, 'archive.org');
assert.equal(normalizedAttachment.storage.externalId, 'awtsmoos-video');
assert.equal(normalizedAttachment.storage.historyUrl, '');

const legacyAttachment = normalizeAttachment({
	id: 'legacy-image',
	mime: 'image/png',
	publicPath: '/uploads/legacy-image.png'
});
assert.equal(legacyAttachment.type, 'image');
assert.equal(legacyAttachment.storage, undefined);
assert.equal(normalizeAttachmentStorage('{"provider":"future-provider","externalId":"asset-1"}').provider, 'future-provider');
assert.equal(normalizeAttachmentStorage('not-json'), undefined);
console.log('richSocial attachmentStorage.test passed');
