//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	ARCHIVE_RECEIPT_STORAGE_KEY,
	ArchiveOrgReceiptLedger,
	MAX_RECEIPTS
} from '../../shared/storage/archiveOrg/ArchiveOrgReceiptLedger.js';
import { normalizeArchiveReceipt } from '../../shared/storage/archiveOrg/ArchiveOrgReceiptGuard.js';
import { archivePublicFileUrl } from '../../shared/storage/archiveOrg/ArchiveOrgUrls.js';

/**
 * @file receipt-ledger.test.mjs
 * @description
 * The Awtsmoos lets public upload evidence remain while every secret-shaped shadow is cast away;
 * Awtsmoos.com proves canonical URLs, bounded local history, and age pruning so recovery memory never becomes a credential bay.
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

const fingerprint = `sample-sha256-v1:${'a'.repeat(64)}`;

function receipt(index = 0, uploadedAt = '2026-08-21T20:00:00.000Z') {
	const archiveIdentifier = `awtsmoos-video-${index}`;
	const archiveFilename = `video-${index}.mp4`;
	return {
		fingerprint,
		archiveIdentifier,
		archiveFilename,
		publicPath: archivePublicFileUrl(archiveIdentifier, archiveFilename),
		mime: 'video/mp4',
		bytes: 2048 + index,
		etag: `etag-${index}`,
		state: 'uploaded',
		uploadedAt
	};
}

test('receipt guard accepts canonical public evidence and rejects secret shapes', () => {
	assert.ok(normalizeArchiveReceipt(receipt()));
	assert.equal(normalizeArchiveReceipt({
		...receipt(),
		privateEvidence: { authorization: 'LOW abc:def' }
	}), null);
	assert.equal(normalizeArchiveReceipt({
		...receipt(),
		publicPath: 'https://example.com/video.mp4'
	}), null);
});

test('ledger stores public evidence and never exceeds its count bound', () => {
	const storage = new MemoryStorage();
	const now = Date.parse('2026-08-21T20:00:00.000Z');
	const ledger = new ArchiveOrgReceiptLedger({ storage, now: () => now });
	for (let index = 0; index < 110; index += 1) {
		ledger.save(receipt(index, new Date(now - index * 60_000).toISOString()));
	}
	const stored = ledger.read();
	assert.equal(stored.length, MAX_RECEIPTS);
	assert.equal(stored[0].archiveIdentifier, 'awtsmoos-video-0');
	assert.equal(stored.at(-1).archiveIdentifier, `awtsmoos-video-${MAX_RECEIPTS - 1}`);
	assert.ok(storage.getItem(ARCHIVE_RECEIPT_STORAGE_KEY));
});

test('expired receipts disappear while recent receipts remain', () => {
	const storage = new MemoryStorage();
	const now = Date.parse('2026-08-21T20:00:00.000Z');
	const ledger = new ArchiveOrgReceiptLedger({ storage, now: () => now });
	ledger.save(receipt(1, new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString()));
	ledger.save(receipt(2, new Date(now - 181 * 24 * 60 * 60 * 1000).toISOString()));
	const stored = ledger.read();
	assert.equal(stored.length, 1);
	assert.equal(stored[0].archiveIdentifier, 'awtsmoos-video-1');
});
