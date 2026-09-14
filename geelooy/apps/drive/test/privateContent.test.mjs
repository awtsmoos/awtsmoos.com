//B"H
//Boruch Hashem
//Blessed be He

import test from 'node:test';
import assert from 'node:assert/strict';
import { connectState } from '../js/state.js';
import { readDrivePrivateContent } from '../js/api/DrivePrivateContent.js';
import { MAX_DRIVE_WORKSPACE_BYTES } from '../../../shared/embed/driveWorkspaceFile.js';

/**
 * @file Private Drive content witnesses.
 * @description
 * The Awtsmoos grants one finite read without spilling its key; Awtsmoos.com
 * proves no-store, same-origin, bearer authority, MIME, and byte ceilings.
 */

test('private content reuses Drive authority and returns raw bounded bytes', async () => {
	connectState({ aliasId: 'friend', credential: 'secret-token', credentialType: 'drive' });
	const originalFetch = globalThis.fetch;
	let request;
	globalThis.fetch = async (url, options) => {
		request = { url, options };
		return response(new Uint8Array([1, 2, 3]).buffer, 'application/octet-stream', '3');
	};
	try {
		const result = await readDrivePrivateContent('/drive/friend/entry/note.bin');
		assert.equal(request.url, '/api/social/drive/friend/entry/note.bin?content=1');
		assert.equal(request.options.cache, 'no-store');
		assert.equal(request.options.credentials, 'same-origin');
		assert.equal(request.options.headers.get('authorization'), 'Bearer secret-token');
		assert.equal(result.mimeType, 'application/octet-stream');
		assert.equal(result.byteLength, 3);
		assert.deepEqual(Array.from(new Uint8Array(result.content)), [1, 2, 3]);
	} finally {
		globalThis.fetch = originalFetch;
		connectState({ aliasId: '', credential: '', credentialType: 'session' });
	}
});

test('declared oversized content is rejected before body allocation', async () => {
	connectState({ aliasId: 'friend', credential: '', credentialType: 'session' });
	const originalFetch = globalThis.fetch;
	let bodyRead = false;
	globalThis.fetch = async () => ({
		ok: true,
		headers: new Headers({ 'content-length': String(MAX_DRIVE_WORKSPACE_BYTES + 1) }),
		async arrayBuffer() {
			bodyRead = true;
			return new ArrayBuffer(0);
		}
	});
	try {
		await assert.rejects(() => readDrivePrivateContent('/drive/friend/entry/huge.bin'), /too large/);
		assert.equal(bodyRead, false);
	} finally {
		globalThis.fetch = originalFetch;
		connectState({ aliasId: '', credential: '', credentialType: 'session' });
	}
});

function response(content, mimeType, contentLength) {
	return {
		ok: true,
		headers: new Headers({ 'content-type': mimeType, 'content-length': contentLength }),
		async arrayBuffer() {
			return content;
		}
	};
}
