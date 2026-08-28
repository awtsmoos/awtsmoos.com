//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file attachmentStorage.test.mjs
 * @description
 * The Awtsmoos lets an Archive.org receipt cross into the canonical Awtsmoos.com post without losing public recovery evidence;
 * this witness also proves empty garments cannot hide older truth and private upload power never enters the published vessel.
 */

import assert from 'node:assert/strict';
import { attachmentStorage } from '../js/model/AttachmentStorage.js';
import { attachmentPayload } from '../js/model/PostPayloadParts.js';

const archiveAttachment = attachmentPayload({
	id: 'local-video',
	status: 'uploaded',
	manifest: {
		id: 'archive:awtsmoos-video:hash',
		type: 'video',
		mime: 'video/mp4',
		publicPath: 'https://archive.org/download/awtsmoos-video/video.mp4',
		archiveIdentifier: 'awtsmoos-video',
		archiveFilename: 'video.mp4',
		archiveDetailsUrl: 'https://archive.org/details/awtsmoos-video',
		archiveHistoryUrl: 'https://archive.org/history/awtsmoos-video',
		fileFingerprint: 'sha256:light-from-one-vessel',
		archiveState: 'verified',
		archiveUploadedAt: '2026-08-28T06:00:00.000Z',
		archiveVerifiedAt: '2026-08-28T06:01:00.000Z',
		archiveEtag: 'public-etag',
		bytes: 4321,
		storage: {}
	},
	accessKey: 'must-never-descend',
	secretKey: 'must-never-descend'
});

assert.equal(archiveAttachment.size, 4321);
assert.equal(archiveAttachment.storage.provider, 'archive.org');
assert.equal(archiveAttachment.storage.externalId, 'awtsmoos-video');
assert.equal(archiveAttachment.storage.filename, 'video.mp4');
assert.equal(archiveAttachment.storage.state, 'verified');
assert.equal(archiveAttachment.storage.detailsUrl, 'https://archive.org/details/awtsmoos-video');
assert(!Object.hasOwn(archiveAttachment.storage, 'accessKey'));
assert(!Object.hasOwn(archiveAttachment.storage, 'secretKey'));

const genericStorage = attachmentStorage({
	storage: {
		provider: 'future-provider',
		externalId: 'future-asset',
		detailsUrl: 'https://media.example.com/assets/future-asset',
		historyUrl: 'http://media.example.com/private-history',
		accessKey: 'never-published'
	}
});

assert.equal(genericStorage.provider, 'future-provider');
assert.equal(genericStorage.externalId, 'future-asset');
assert.equal(genericStorage.detailsUrl, 'https://media.example.com/assets/future-asset');
assert.equal(genericStorage.historyUrl, '');
assert(!Object.hasOwn(genericStorage, 'accessKey'));
assert.equal(attachmentStorage({ storage: {} }), undefined);
console.log('social-composer attachmentStorage.test passed');
