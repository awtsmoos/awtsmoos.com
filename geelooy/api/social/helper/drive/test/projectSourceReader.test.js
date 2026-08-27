//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	MAX_FILE_BYTES,
	MAX_TOTAL_BYTES,
	normalizeProjectSourceSnapshot
} = require('../projectSourceReader.js');

/**
 * @file Provider source-boundary witnesses.
 * @description
 * The Awtsmoos lets project source approach an external provider only after its measure is known;
 * Awtsmoos.com proves paths, uniqueness, canonical Base64, and decoded byte ceilings before any cloud may receive the flow.
 */

test('normalizes bounded source and reports decoded bytes', () => {
	const contentBase64 = Buffer.from('B"H\nhello\n').toString('base64');
	const snapshot = normalizeProjectSourceSnapshot({
		files: [{ path: 'public/index.html', contentBase64 }]
	});
	assert.deepEqual(snapshot.files, [{ path: 'public/index.html', contentBase64 }]);
	assert.equal(snapshot.totalBytes, Buffer.byteLength('B"H\nhello\n'));
});

test('rejects absolute, traversal, alternate-separator, and duplicate paths', () => {
	for (const sourcePath of ['/root.txt', '../root.txt', 'a/../b.txt', 'a\\b.txt']) {
		assert.throws(
			() => normalizeProjectSourceSnapshot({ files: [{ path: sourcePath, contentBase64: '' }] }),
			error => error?.code === 'PROJECT_SOURCE_PATH_INVALID'
		);
	}
	assert.throws(
		() => normalizeProjectSourceSnapshot({
			files: [
				{ path: 'a//b.txt', contentBase64: '' },
				{ path: 'a/b.txt', contentBase64: '' }
			]
		}),
		error => error?.code === 'PROJECT_SOURCE_PATH_DUPLICATE'
	);
});

test('rejects malformed Base64 and decoded per-file overflow', () => {
	assert.throws(
		() => normalizeProjectSourceSnapshot({ files: [{ path: 'a.txt', contentBase64: 'not base64!' }] }),
		error => error?.code === 'PROJECT_SOURCE_BASE64_INVALID'
	);
	const oversized = Buffer.alloc(MAX_FILE_BYTES + 1).toString('base64');
	assert.throws(
		() => normalizeProjectSourceSnapshot({ files: [{ path: 'huge.bin', contentBase64: oversized }] }),
		error => error?.code === 'PROJECT_SOURCE_FILE_BYTES_EXCEEDED'
	);
});

test('rejects aggregate decoded-byte overflow without duplicating payload memory', () => {
	const chunkBytes = MAX_FILE_BYTES;
	const contentBase64 = Buffer.alloc(chunkBytes).toString('base64');
	const exactCount = Math.floor(MAX_TOTAL_BYTES / chunkBytes);
	const files = Array.from({ length: exactCount }, (_, index) => ({
		path: `part-${index}.bin`,
		contentBase64
	}));
	files.push({ path: 'overflow.bin', contentBase64: 'QQ==' });
	assert.throws(
		() => normalizeProjectSourceSnapshot({ files }),
		error => error?.code === 'PROJECT_SOURCE_TOTAL_BYTES_EXCEEDED'
	);
});
