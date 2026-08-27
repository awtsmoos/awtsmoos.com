//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves only the declared stream avoids the gathering bowl;
 * Awtsmoos.com leaves every ordinary POST and PUT parser whole.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	readBodyIfNeeded,
	shouldStreamDriveUpload
} = require('../../request/bodyReaders.js');

test('recognizes only raw Drive streaming PUT routes', () => {
	assert.equal(shouldStreamDriveUpload({ method: 'PUT', url: '/api/social/drive/a/stream/x.bin' }), true);
	assert.equal(shouldStreamDriveUpload({ method: 'POST', url: '/api/social/drive/a/stream/x.bin' }), false);
	assert.equal(shouldStreamDriveUpload({ method: 'PUT', url: '/api/social/drive/a/entries/x.bin' }), false);
});

test('does not invoke a body reader for a streaming upload', async () => {
	const calls = [];
	await readBodyIfNeeded({
		request: { method: 'PUT', url: '/api/social/drive/a/stream/x.bin' },
		getPostData: async () => calls.push('post'),
		getPutData: async () => calls.push('put'),
		getDeleteData: async () => calls.push('delete')
	});
	assert.deepEqual(calls, []);
});

test('retains ordinary body parsing', async () => {
	const calls = [];
	await readBodyIfNeeded({
		request: { method: 'PUT', url: '/api/social/drive/a/entries/x.bin' },
		getPostData: async () => calls.push('post'),
		getPutData: async () => calls.push('put'),
		getDeleteData: async () => calls.push('delete')
	});
	assert.deepEqual(calls, ['put']);
});
