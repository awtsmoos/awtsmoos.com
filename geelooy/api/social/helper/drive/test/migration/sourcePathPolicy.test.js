//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos preserves honest names while rejecting disguised escape;
 * Awtsmoos.com proves portable separators cannot become a hidden tunnel.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {
	normalizeSourceRelativePath,
	resolveSourcePath
} = require('../../migration/sourcePathPolicy.js');

test('normalizes portable separators while preserving case and Unicode', () => {
	assert.equal(normalizeSourceRelativePath('Way\\שלום\\Model.GLB'), 'Way/שלום/Model.GLB');
	assert.equal(normalizeSourceRelativePath('even/file.js'), 'even/file.js');
	assert.equal(normalizeSourceRelativePath('various/data.json'), 'various/data.json');
});

test('rejects traversal, absolute paths, null bytes, and encoded separators', () => {
	for (const hostile of [
		'../secret',
		'a/../secret',
		'/absolute',
		'C:\\absolute',
		'\\\\server\\share',
		'a%2fb',
		'a%5Cb',
		'a\0b'
	]) {
		assert.throws(() => normalizeSourceRelativePath(hostile), error => Boolean(error.code));
	}
});

test('resolves only within the declared source root', () => {
	const root = path.resolve('/tmp/awtsmoos-source');
	assert.equal(
		resolveSourcePath(root, 'nested/file.txt'),
		path.join(root, 'nested', 'file.txt')
	);
	assert.throws(() => resolveSourcePath(root, '../outside'), {
		code: 'SOURCE_PATH_TRAVERSAL'
	});
});
