// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file virtual_fs_random_read_cache_test.js
 * @description
 * The Awtsmoos lets small compressed immutable blobs reveal once and cache within a
 * strict budget, while large bodies remain disk-native and dishonest decompression
 * metadata is refused before physical blob reads can allocate an oversized body.
 */

const assert = require('node:assert/strict');
const zlib = require('node:zlib');
const {
	CODEC,
	encodeBody,
	readDataRecord
} = require('../api/fs/v3/blobValue.js');

function compressedFixture(content, options = {}) {
	const compressed = zlib.deflateRawSync(content);
	let physicalReads = 0;
	const db = {
		options,
		blob: {
			read() {
				physicalReads += 1;
				return compressed;
			}
		}
	};
	const inode = {
		size: content.length,
		data: {
			__awtsmoosBlob: true,
			id: 'immutable-blob-a',
			offset: 4096,
			length: compressed.length,
			meta: {
				fs3Codec: CODEC,
				originalBytes: content.length
			}
		}
	};
	return { db, inode, physicalReads: () => physicalReads };
}

const content = Buffer.from('B"H one revealed byte, one bounded inflation. '.repeat(4000));
const cached = compressedFixture(content);
for (let index = 0; index < 5000; index += 1) {
	const offset = (index * 97) % content.length;
	assert.equal(readDataRecord(cached.db, cached.inode, offset, 1)[0], content[offset]);
}
assert.equal(cached.physicalReads(), 1, 'random reads repeatedly inflated one immutable blob');

cached.inode.data = {
	...cached.inode.data,
	id: 'immutable-blob-b'
};
readDataRecord(cached.db, cached.inode, 0, 1);
assert.equal(cached.physicalReads(), 2, 'new immutable identity reused stale decoded bytes');

const largeBody = Buffer.alloc(24 * 1024 * 1024, 0x41);
const largeEncoded = encodeBody({ options: {} }, largeBody);
assert.equal(largeEncoded.metadata.fs3Codec, undefined, 'large bodies must remain disk-native');
assert.equal(largeEncoded.bytes, largeBody, 'large uncompressed body should not be copied');

const overLimit = compressedFixture(Buffer.alloc(21 * 1024 * 1024, 0x41));
assert.throws(
	() => readDataRecord(overLimit.db, overLimit.inode, 0, 1),
	error => error.code === 'AWTSMOOS_FS3_DECOMPRESSION_LIMIT'
);
assert.equal(overLimit.physicalReads(), 0, 'oversized compressed body was read before metadata rejection');

const dishonest = compressedFixture(content);
dishonest.inode.data.meta.originalBytes = 128;
assert.throws(
	() => readDataRecord(dishonest.db, dishonest.inode, 0, 1),
	error => ['AWTSMOOS_FS3_DECOMPRESSION_LIMIT', 'AWTSMOOS_FS3_DECOMPRESSION_FAILED'].includes(error.code)
);

const bounded = compressedFixture(content, { virtualFsMaxDecompressedBytes: 1024 });
assert.throws(
	() => readDataRecord(bounded.db, bounded.inode, 0, 1),
	error => error.code === 'AWTSMOOS_FS3_DECOMPRESSION_LIMIT'
);
assert.equal(bounded.physicalReads(), 0, 'bounded body was read before metadata rejection');

console.log('B"H virtual_fs_random_read_cache_test PASS');
