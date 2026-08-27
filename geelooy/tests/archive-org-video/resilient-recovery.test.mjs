//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { archiveFilenameFor, archiveIdentifierFor } from '../../shared/storage/archiveOrg/ArchiveOrgIdentity.js';
import { ArchiveOrgInflightRegistry } from '../../shared/storage/archiveOrg/ArchiveOrgInflightRegistry.js';
import { ArchiveOrgReceiptLedger } from '../../shared/storage/archiveOrg/ArchiveOrgReceiptLedger.js';
import { ArchiveOrgUploadError } from '../../shared/storage/archiveOrg/ArchiveOrgUploader.js';
import { ArchiveOrgUploadService } from '../../shared/storage/archiveOrg/ArchiveOrgUploadService.js';
import { archivePublicFileUrl } from '../../shared/storage/archiveOrg/ArchiveOrgUrls.js';

/**
 * @file resilient-recovery.test.mjs
 * @description
 * The Awtsmoos lets accepted bytes survive delayed public visibility, checkpoint memory, and transient Archive storms;
 * Awtsmoos.com proves no retransmission after lag, exact fingerprint adoption, and bounded retry before public evidence reforms.
 */
class MemoryStorage {
	constructor() {
		this.values = new Map();
	}
	getItem(key) {
		return this.values.get(key) ?? null;
	}
	setItem(key, value) {
		this.values.set(key, String(value));
	}
	removeItem(key) {
		this.values.delete(key);
	}
}

const fingerprint = `sample-sha256-v1:${'c'.repeat(64)}`;
const file = { name: 'video.mp4', size: 8192, type: 'video/mp4' };
const item = { provider: 'youtube', sourceId: 'source-2', title: 'Recovery video' };
const mediaPath = 'video.mp4';

function createService({ uploader, verifier, wait = async () => {} } = {}) {
	return new ArchiveOrgUploadService({
		ledger: new ArchiveOrgReceiptLedger({ storage: new MemoryStorage() }),
		inflight: new ArchiveOrgInflightRegistry(new Map()),
		fingerprint: async () => fingerprint,
		overloadClient: { check: async () => ({ overLimit: false }) },
		uploader,
		verifier,
		wait,
		now: () => '2026-08-21T20:00:00.000Z'
	});
}

const credentials = async () => ({ accessKey: 'access', secretKey: 'secret' });

test('verification lag never retransmits already accepted bytes', async () => {
	let puts = 0;
	let verifies = 0;
	const service = createService({
		uploader: { put: async () => ({ status: 200, etag: `etag-${++puts}` }) },
		verifier: {
			async verify() {
				verifies += 1;
				return { verified: verifies > 1, reason: verifies > 1 ? 'FILE_LISTED' : 'FILE_NOT_LISTED' };
			}
		}
	});
	const first = await service.uploadVideo({ file, item, mediaPath, credentialsProvider: credentials });
	const second = await service.uploadVideo({ file, item, mediaPath, credentialsProvider: credentials });
	assert.equal(first.archiveState, 'uploaded');
	assert.equal(second.archiveState, 'verified');
	assert.equal(puts, 1);
});

test('matching fingerprinted checkpoint repopulates an empty shared ledger', async () => {
	const identifier = archiveIdentifierFor(item, mediaPath);
	const filename = archiveFilenameFor(file, mediaPath, fingerprint);
	const existingAsset = {
		publicPath: archivePublicFileUrl(identifier, filename),
		mime: file.type,
		archiveIdentifier: identifier,
		archiveFilename: filename,
		fileFingerprint: fingerprint,
		archiveState: 'verified',
		archiveUploadedAt: '2026-08-21T19:00:00.000Z',
		archiveVerifiedAt: '2026-08-21T19:01:00.000Z',
		bytes: file.size
	};
	const service = createService({
		uploader: { put: async () => { throw new Error('PUT must not run'); } },
		verifier: { verify: async () => ({ verified: true }) }
	});
	const asset = await service.uploadVideo({
		file,
		item,
		mediaPath,
		existingAsset,
		credentialsProvider: async () => { throw new Error('credentials must not run'); }
	});
	assert.equal(asset.publicPath, existingAsset.publicPath);
	assert.equal(asset.archiveState, 'verified');
});

test('retryable server failures back off and then succeed within the attempt bound', async () => {
	let puts = 0;
	const waits = [];
	const service = createService({
		uploader: {
			async put() {
				puts += 1;
				if (puts < 3) throw new ArchiveOrgUploadError('temporary', 'SERVER', 500);
				return { status: 200, etag: 'final-etag' };
			}
		},
		verifier: { verify: async () => ({ verified: false }) },
		wait: async milliseconds => waits.push(milliseconds)
	});
	await service.uploadVideo({ file, item, mediaPath, credentialsProvider: credentials });
	assert.equal(puts, 3);
	assert.deepEqual(waits, [800, 1600]);
});
