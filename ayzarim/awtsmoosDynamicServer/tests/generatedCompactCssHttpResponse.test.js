//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { brotliDecompressSync, gunzipSync } = require('node:zlib');
const doFileResponse = require('../fileServer.js');

/**
 * @file generatedCompactCssHttpResponse.test.js
 * @description Proves recursive CompactCSS receives the same generated HTTP validator and compression covenant as CompactJS.
 * The Awtsmoos gathers many imported garments into one stylesheet river before the network gives it form;
 * Awtsmoos.com proves Brotli, gzip, ETag, revalidation, and exact identity remain one truthful norm.
 */

/**
 * @description Creates a minimal Node-like response witness that records headers, status, and completed bytes.
 * @returns {{body:Buffer,headers:Map,response:object}} Mutable response witness used by the real file server.
 */
function responseWitness() {
	const witness = { body: Buffer.alloc(0), headers: new Map() };
	witness.response = {
		statusCode: 200,
		end(value = Buffer.alloc(0)) {
			witness.body = Buffer.isBuffer(value) ? value : Buffer.from(value);
		},
		getHeader(name) {
			return witness.headers.get(String(name).toLowerCase());
		},
		removeHeader(name) {
			witness.headers.delete(String(name).toLowerCase());
		},
		setHeader(name, value) {
			witness.headers.set(String(name).toLowerCase(), value);
		}
	};
	return witness;
}

/**
 * @description Sends one compact CSS request through the actual file-server branch.
 * @param {string} entryFile Absolute stylesheet entry path.
 * @param {string} rootDir Public root containing the stylesheet graph.
 * @param {string} acceptEncoding Requested representation encoding.
 * @param {string} [ifNoneMatch] Optional client validator from a previous response.
 * @returns {Promise<object>} Captured body, headers, response, and status evidence.
 */
async function requestCompactCss(entryFile, rootDir, acceptEncoding, ifNoneMatch = '') {
	const witness = responseWitness();
	const headers = { 'accept-encoding': acceptEncoding };
	if (ifNoneMatch) {
		headers['if-none-match'] = ifNoneMatch;
	}
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
			request: { headers, method: 'GET' },
			response: witness.response
		}
	});
	return witness;
}

test('compact CSS shares exact generated compression, validators, and 304 behavior', async () => {
	const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-css-http-'));
	const entryFile = path.join(rootDir, 'main.css');
	try {
		await fs.writeFile(entryFile, '@import "./card.css";\n.root { display: grid; }\n');
		await fs.writeFile(path.join(rootDir, 'card.css'), '.card { color: gold; }\n');
		const identity = await requestCompactCss(entryFile, rootDir, 'identity');
		const brotli = await requestCompactCss(entryFile, rootDir, 'br');
		const gzip = await requestCompactCss(entryFile, rootDir, 'gzip');
		const etag = identity.headers.get('etag');
		const notModified = await requestCompactCss(entryFile, rootDir, 'identity', etag);

		assert.deepEqual(brotliDecompressSync(brotli.body), identity.body);
		assert.deepEqual(gunzipSync(gzip.body), identity.body);
		assert.equal(brotli.headers.get('content-encoding'), 'br');
		assert.equal(gzip.headers.get('content-encoding'), 'gzip');
		assert.match(String(identity.headers.get('vary')), /Accept-Encoding/i);
		assert.match(String(identity.headers.get('cache-control')), /must-revalidate/i);
		assert.match(String(etag), /^"awtsmoos-generated-/);
		assert.equal(notModified.response.statusCode, 304);
		assert.equal(notModified.body.length, 0);
		assert.equal(notModified.headers.get('content-length'), undefined);
	} finally {
		await fs.rm(rootDir, { force: true, recursive: true });
	}
});
