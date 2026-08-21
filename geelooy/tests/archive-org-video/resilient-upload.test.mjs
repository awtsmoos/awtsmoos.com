//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { ArchiveOrgInflightRegistry } from '../../shared/storage/archiveOrg/ArchiveOrgInflightRegistry.js';
import { ArchiveOrgReceiptLedger } from '../../shared/storage/archiveOrg/ArchiveOrgReceiptLedger.js';
import { ArchiveOrgUploadService } from '../../shared/storage/archiveOrg/ArchiveOrgUploadService.js';

/**
 * @file resilient-upload.test.mjs
 * @description
 * The Awtsmoos lets simultaneous hands share one upload and lets a later reload reuse public evidence before any secret gate;
 * Awtsmoos.com proves one credential acquisition, one PUT, and zero retransmission once the public receipt exists in state.
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

const fingerprint = `sample-sha256-v1:${'b'.repeat(64)}`;
const file = { name: 'same-video.mp4', size: 4096, type: 'video/mp4' };
const item = { provider: 'test', sourceId: 'source-1', title: 'Video' };

function serviceHarness() {
	const ledger = new ArchiveOrgReceiptLedger({ storage: new MemoryStorage() });
	const counts = { credentials: 0, puts: 0, verifies: 0 };
	const service = new ArchiveOrgUploadService({
		ledger,
		inflight: new ArchiveOrgInflightRegistry(new Map()),
		fingerprint: async () => fingerprint,
		overloadClient: { check: async () => ({ overLimit: false }) },
		uploader: {
			async put() {
				counts.puts += 1;
				await new Promise(resolve => setTimeout(resolve, 5));
				return { status: 200, etag: 'public-etag' };
			}
		},
		verifier: {
			async verify() {
				counts.verifies += 1;
				return { verified: false, reason: 'FILE_NOT_LISTED' };
			}
		},
		now: () => '2026-08-21T20:00:00.000Z'
	});
	const credentialsProvider = async () => {
		counts.credentials += 1;
		return { accessKey: 'access', secretKey: 'secret' };
	};
	return { service, counts, credentialsProvider };
}

test('concurrent identical uploads share one credential read and one PUT', async () => {
	const harness = serviceHarness();
	const input = { file, item, mediaPath: 'folder/same-video.mp4', credentialsProvider: harness.credentialsProvider };
	const [first, second] = await Promise.all([
		harness.service.uploadVideo(input),
		harness.service.uploadVideo(input)
	]);
	assert.equal(harness.counts.credentials, 1);
	assert.equal(harness.counts.puts, 1);
	assert.equal(first.publicPath, second.publicPath);
	assert.equal(first.archiveState, 'uploaded');
	assert.match(first.archiveFilename, /-b{12}\.mp4$/);
});

test('a later receipt hit skips credentials and byte transport entirely', async () => {
	const harness = serviceHarness();
	const input = { file, item, mediaPath: 'folder/same-video.mp4', credentialsProvider: harness.credentialsProvider };
	const first = await harness.service.uploadVideo(input);
	const second = await harness.service.uploadVideo({
		...input,
		credentialsProvider: async () => {
			throw new Error('credentials must not be requested on receipt reuse');
		}
	});
	assert.equal(harness.counts.credentials, 1);
	assert.equal(harness.counts.puts, 1);
	assert.equal(second.publicPath, first.publicPath);
	assert.equal(second.archiveState, 'uploaded');
});
