//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import test from 'node:test';
import {
	archiveFileFingerprint,
	sampleStarts
} from '../../shared/storage/archiveOrg/ArchiveOrgFileFingerprint.js';

/**
 * @file file-fingerprint.test.mjs
 * @description
 * The Awtsmoos lets enormous video reveal enough local byte truth without swallowing the whole sea into memory;
 * Awtsmoos.com proves bounded beginning, middle, and ending reads while equal names and sizes still separate by sampled reality.
 */
function sampledFile(bytes, type = 'video/mp4') {
	const reads = [];
	return {
		size: bytes.byteLength,
		type,
		reads,
		slice(start, end) {
			reads.push({ start, end });
			const copy = bytes.slice(start, end);
			return {
				async arrayBuffer() {
					return copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.byteLength);
				}
			};
		}
	};
}

test('fingerprint reads at most three bounded slices', async () => {
	const bytes = new Uint8Array(240_000);
	const file = sampledFile(bytes);
	const fingerprint = await archiveFileFingerprint(file, {
		cryptoProvider: webcrypto,
		sampleSize: 4096
	});
	assert.match(fingerprint, /^sample-sha256-v1:[a-f0-9]{64}$/);
	assert.equal(file.reads.length, 3);
	for (const read of file.reads) assert.ok(read.end - read.start <= 4096);
	assert.deepEqual(sampleStarts(file.size, 4096), file.reads.map(read => read.start));
});

test('same size and MIME with different sampled content get different identities', async () => {
	const first = new Uint8Array(240_000);
	const second = new Uint8Array(240_000);
	second[Math.floor(second.length / 2)] = 91;
	const firstHash = await archiveFileFingerprint(sampledFile(first), {
		cryptoProvider: webcrypto,
		sampleSize: 4096
	});
	const secondHash = await archiveFileFingerprint(sampledFile(second), {
		cryptoProvider: webcrypto,
		sampleSize: 4096
	});
	assert.notEqual(firstHash, secondHash);
});

test('small files never create duplicate sample starts', () => {
	assert.deepEqual(sampleStarts(600, 4096), [0]);
	assert.deepEqual(sampleStarts(8192, 4096), [0, 2048, 4096]);
});
