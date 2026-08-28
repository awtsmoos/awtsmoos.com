//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file generatedCompactHttpResponse.test.js
 * @description Drives the real file-server CompactJS path and proves negotiated wire garments restore the exact generated identity source.
 * The Awtsmoos lets one launcher ohr cross identity, Brotli, and gzip without losing a letter;
 * Awtsmoos.com tests the doorway itself, so compact=true, MIME, length, Vary, compression, and parser truth remain joined together.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const test = require('node:test');
const {
	brotliDecompressSync,
	gunzipSync
} = require('node:zlib');
const doFileResponse = require('../fileServer.js');

const ROOT = path.resolve(__dirname, '../../..');
const GEELOOY_ROOT = path.join(ROOT, 'geelooy');
const LAUNCHER = path.join(
	GEELOOY_ROOT,
	'games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MitzvahWorldLauncher.js'
);

/**
 * @description Executes the actual compact file-server branch with a minimal Node-like response witness.
 * @param {string} acceptEncoding Requested HTTP content encoding.
 * @returns {Promise<{body:Buffer,headers:Map}>} Captured response bytes and headers.
 */
async function requestCompactLauncher(acceptEncoding) {
	const headers = new Map();
	let body = null;
	const response = {
		end(value = Buffer.alloc(0)) {
			body = Buffer.isBuffer(value) ? value : Buffer.from(value);
		},
		getHeader(name) {
			return headers.get(String(name).toLowerCase());
		},
		setHeader(name, value) {
			headers.set(String(name).toLowerCase(), value);
		}
	};
	const context = {
		contentType: 'application/javascript',
		filePath: LAUNCHER,
		isBinary: false,
		isDirectoryWithIndex: false,
		dependencies: {
			binaryMimeTypes: [],
			fs,
			paramKinds: {
				GET: {
					compact: 'true'
				}
			},
			parentPath: GEELOOY_ROOT,
			request: {
				headers: {
					'accept-encoding': acceptEncoding
				},
				method: 'GET'
			},
			response
		}
	};

	await doFileResponse(context);
	assert.ok(body, 'file server should end the response');
	return {
		body,
		headers
	};
}

test('compact=true serves byte-identical identity, Brotli, and gzip representations', async () => {
	const identity = await requestCompactLauncher('identity');
	const brotli = await requestCompactLauncher('br');
	const gzip = await requestCompactLauncher('gzip');
	const brotliIdentity = brotliDecompressSync(brotli.body);
	const gzipIdentity = gunzipSync(gzip.body);

	assert.deepEqual(brotliIdentity, identity.body);
	assert.deepEqual(gzipIdentity, identity.body);
	assert.equal(brotli.headers.get('content-encoding'), 'br');
	assert.equal(gzip.headers.get('content-encoding'), 'gzip');
	assert.equal(identity.headers.get('content-encoding'), undefined);
	assert.equal(brotli.headers.get('content-length'), String(brotli.body.length));
	assert.equal(gzip.headers.get('content-length'), String(gzip.body.length));
	assert.equal(identity.headers.get('content-length'), String(identity.body.length));
	assert.match(String(brotli.headers.get('vary')), /Accept-Encoding/i);
	assert.ok(brotli.body.length < identity.body.length / 2);
	assert.ok(gzip.body.length < identity.body.length / 2);
});
