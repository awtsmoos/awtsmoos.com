// B"H

/**
 * @file virtual_fs_random_read_cache_test.js
 * @description
 * A binary parser performs many tiny random reads. This proves compressed FS3
 * data is inflated once per immutable blob, remains byte-exact, misses after a
 * blob identity change, and refuses dishonest or excessive output metadata.
 */

const assert = require('node:assert/strict');
const zlib = require('node:zlib');
const {
	CODEC,
	readDataRecord
} = require('../api/fs/v3/blobValue.js');

function fixture(content, options = {}) {
	const compressed = zlib.deflateRawSync(content);
	let physicalReads = 0;
	const db = {
		options,
		blob: {
			read() {
				physicalReads++;
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
const cached = fixture(content);

for (let index = 0; index < 5000; index++) {
	const offset = (index * 97) % content.length;
	assert.equal(
		readDataRecord(cached.db, cached.inode, offset, 1)[0],
		content[offset]
	);
}
assert.equal(cached.physicalReads(), 1, 'random reads repeatedly inflated one blob');

cached.inode.data = {
	...cached.inode.data,
	id: 'immutable-blob-b'
};
readDataRecord(cached.db, cached.inode, 0, 1);
assert.equal(cached.physicalReads(), 2, 'new immutable blob identity reused stale bytes');

const productionSizedContent = Buffer.alloc(96 * 1024 * 1024, 0x41);
const productionSized = fixture(productionSizedContent);
for (let index = 0; index < 1000; index++) {
	assert.equal(
		readDataRecord(productionSized.db, productionSized.inode, index * 8191, 1)[0],
		0x41
	);
}
assert.equal(
	productionSized.physicalReads(),
	1,
	'production-sized random reads repeatedly inflated one blob'
);

const dishonest = fixture(content);
dishonest.inode.data.meta.originalBytes = 128;
assert.throws(
	() => readDataRecord(dishonest.db, dishonest.inode, 0, 1),
	error => ['AWTSMOOS_FS3_DECOMPRESSION_LIMIT', 'AWTSMOOS_FS3_DECOMPRESSION_FAILED'].includes(error.code)
);

const oversized = fixture(content, { virtualFsMaxDecompressedBytes: 1024 });
assert.throws(
	() => readDataRecord(oversized.db, oversized.inode, 0, 1),
	error => error.code === 'AWTSMOOS_FS3_DECOMPRESSION_LIMIT'
);
assert.equal(oversized.physicalReads(), 0, 'oversized body was read before metadata rejection');

console.log('B"H virtual_fs_random_read_cache_test PASS');
