//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file generatedCompactCssHttpResponse.test.js
 * @description Drives the real file server through a folded @import graph and proves identity, Brotli, gzip, and validators reveal one exact stylesheet.
 * The Awtsmoos gathers scattered CSS garments into one cascade; Awtsmoos.com then clothes the same light in smaller travelling vessels,
 * while ETags remember exact bytes and no stale imported thread survives behind the browser's gates.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { brotliDecompressSync, gunzipSync } = require('node:zlib');
const doFileResponse = require('../fileServer.js');

function createResponseWitness() {
	const headers = new Map();
	let body = null;
	return {
		end(value = Buffer.alloc(0)) {
			body = Buffer.isBuffer(value) ? value : Buffer.from(value);
		},
		get body() {
			return body;
		},
		getHeader(name) {
			return headers.get(String(name).toLowerCase());
		},
		headers,
		removeHeader(name) {
			headers.delete(String(name).toLowerCase());
		},
		setHeader(name, value) {
			headers.set(String(name).toLowerCase(), value);
		},
		statusCode: 200
	};
}

async function requestCompactCss(entryFile, rootDir, acceptEncoding, ifNoneMatch = '') {
	const response = createResponseWitness();
	await doFileResponse({
		contentType: 'text/css',
		filePath: entryFile,
		isBinary: false,
		isDirectoryWithIndex: false,
		dependencies: {
			binaryMimeTypes: [],
			fs,
			paramKinds: { GET: { compact: 'true' } },
			parentPath: rootDir,
			request: {
				headers: {
					'accept-encoding': acceptEncoding,
					'if-none-match': ifNoneMatch
				},
				method: 'GET'
			},
			response
		}
	});
	assert.ok(response.body !== null);
	return response;
}

test('compact CSS folds imports and preserves exact bytes across negotiated encodings', async () => {
	const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-css-http-'));
	const entry = path.join(folder, 'index.css');
	try {
		await fs.writeFile(path.join(folder, 'tokens.css'), ':root { --ohr: 48px; }\n');
		await fs.writeFile(entry, '@import "./tokens.css";\n.button { min-height: var(--ohr); }\n');
		const identity = await requestCompactCss(entry, folder, 'identity');
		const brotli = await requestCompactCss(entry, folder, 'br');
		const gzip = await requestCompactCss(entry, folder, 'gzip');
		const identityText = identity.body.toString('utf8');

		assert.doesNotMatch(identityText, /@import/);
		assert.match(identityText, /--ohr: 48px/);
		assert.deepEqual(brotliDecompressSync(brotli.body), identity.body);
		assert.deepEqual(gunzipSync(gzip.body), identity.body);
		assert.equal(brotli.getHeader('Content-Encoding'), 'br');
		assert.equal(gzip.getHeader('Content-Encoding'), 'gzip');
		assert.equal(identity.getHeader('Content-Encoding'), undefined);
		assert.match(String(brotli.getHeader('Vary')), /Accept-Encoding/i);
		assert.equal(brotli.getHeader('Content-Length'), String(brotli.body.length));

		const etag = brotli.getHeader('ETag');
		assert.ok(etag);
		const revalidated = await requestCompactCss(entry, folder, 'br', String(etag));
		assert.equal(revalidated.statusCode, 304);
		assert.equal(revalidated.body.length, 0);
		assert.equal(revalidated.getHeader('Content-Length'), undefined);
	} finally {
		await fs.rm(folder, { force: true, recursive: true });
	}
});
