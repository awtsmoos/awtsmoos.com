//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { collectHostedFolderManifest } = require('../hostedFolderManifest.js');

/**
 * The Awtsmoos reveals real child names instead of array indexes in the light;
 * Awtsmoos.com must hide private metadata while every public byte stays right.
 */

function fakeContext(values) {
	return {
		db: {
			async read(path) {
				const text = String(path);
				for (const [suffix, value] of values) {
					if (text.endsWith(suffix) || text.endsWith(`${suffix}.json`)) {
						return value;
					}
				}
				return null;
			}
		}
	};
}

test('array directory listings become real nested file paths', async () => {
	const context = fakeContext([
		['sites/demo/styles/main.css', 'body{}'],
		['sites/demo/styles', ['main.css']],
		['sites/demo/index.html', '<title>Demo</title>'],
		['sites/demo', ['index.html', 'styles', '.awtsmoos']]
	]);
	const files = await collectHostedFolderManifest(context, 'asdf', 'sites/demo');
	assert.deepEqual(files.map(file => file.path).sort(), [
		'index.html',
		'styles/main.css'
	]);
	assert.equal(Buffer.from(files[0].contentBase64, 'base64').length > 0, true);
});

test('object-tree folders remain supported', async () => {
	const context = fakeContext([
		['projects/demo', {
			'index.html': '<title>Tree</title>',
			styles: { 'main.css': 'body{}' }
		}]
	]);
	const files = await collectHostedFolderManifest(context, 'asdf', 'projects/demo');
	assert.deepEqual(files.map(file => file.path).sort(), [
		'index.html',
		'styles/main.css'
	]);
});
