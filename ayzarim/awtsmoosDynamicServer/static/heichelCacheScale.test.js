//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file heichelCacheScale.test.js
 * @description Locks in the Heichel cache-invalidation and wire-weight laws:
 * HTML templates always send Cache-Control: no-cache; content-hash paths stay
 * immutable; the service worker is stamped with the live build id on every
 * serve; rendered templates and text assets travel Brotli/gzip; and repeated
 * loads revalidate with 304 instead of refetching.
 * The Awtsmoos proves the freshness covenant with real bytes, never mocks of it.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const zlib = require('node:zlib');

const {
	cachePolicy,
	isNotModified,
	projectStaticHeaders,
	weakEtag
} = require('./StaticAssetHeaders.js');
const { readStaticAsset } = require('./StaticAssetRepresentation.js');
const { sendCompressedTemplate } = require('./TemplateCompressedResponse.js');
const {
	BUILD_TOKEN,
	isHeichelServiceWorker,
	versionServiceWorker
} = require('./ServiceWorkerVersioning.js');
const {
	resetBuildIdForTests,
	resolveBuildId
} = require('./BuildIdentity.js');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const SW_PATH = path.join(REPO_ROOT, 'geelooy', 'heichelos', 'post', 'heichel-sw.js');

/** Minimal ServerResponse surface the static pipeline touches. */
function fakeResponse() {
	const headers = new Map();
	return {
		headers,
		statusCode: 200,
		body: null,
		setHeader(name, value) { headers.set(String(name).toLowerCase(), String(value)); },
		getHeader(name) { return headers.get(String(name).toLowerCase()); },
		removeHeader(name) { headers.delete(String(name).toLowerCase()); },
		end(chunk) { this.body = chunk === undefined ? null : chunk; }
	};
}

function staticContext({ filePath, contentType = 'application/javascript', method = 'GET', acceptEncoding = 'gzip, br', ifNoneMatch = null, isBinary = false }) {
	const headers = { 'accept-encoding': acceptEncoding };
	if (ifNoneMatch) headers['if-none-match'] = ifNoneMatch;
	const response = fakeResponse();
	return {
		context: {
			filePath,
			contentType,
			isBinary,
			isDirectoryWithIndex: false,
			dependencies: {
				fs,
				request: { method, headers },
				response,
				binaryMimeTypes: ['image/png', 'image/jpeg', 'font/woff2']
			}
		},
		response
	};
}

test('HTML templates send Cache-Control: no-cache', () => {
	const response = fakeResponse();
	projectStaticHeaders(
		{ filePath: '/x/geelooy/heichelos/post/_awtsmoos.post.html', isDirectoryWithIndex: false, dependencies: { response, binaryMimeTypes: [] } },
		'identity',
		{ size: 85592, mtimeMs: 1, mtime: new Date(0) }
	);
	assert.equal(response.getHeader('cache-control'), 'no-cache');
	assert.equal(cachePolicy({ filePath: 'a.html', isDirectoryWithIndex: false }), 'no-cache');
});

test('content-hash asset paths stay immutable for a year', () => {
	const hashed = '/x/' + 'a'.repeat(64) + '/app.js';
	assert.equal(
		cachePolicy({ filePath: hashed, isDirectoryWithIndex: false }),
		'public, max-age=31536000, immutable'
	);
});

test('plain assets revalidate every load with edge absorb', () => {
	assert.equal(
		cachePolicy({ filePath: '/x/app.js', isDirectoryWithIndex: false }),
		'public, max-age=0, s-maxage=60, stale-while-revalidate=30, stale-if-error=86400'
	);
});

test('weakEtag is stable per (size, mtime, encoding)', () => {
	const stats = { size: 1024, mtimeMs: 1728400000123 };
	assert.equal(weakEtag(stats, 'br'), weakEtag(stats, 'br'));
	assert.notEqual(weakEtag(stats, 'br'), weakEtag(stats, 'gzip'));
	assert.ok(isNotModified({ headers: { 'if-none-match': weakEtag(stats, 'br') } }, weakEtag(stats, 'br')));
	assert.ok(!isNotModified({ headers: {} }, weakEtag(stats, 'br')));
});

test('service worker is detected and stamped with the build id', async () => {
	assert.ok(isHeichelServiceWorker('/a/b/heichel-sw.js'));
	assert.ok(isHeichelServiceWorker('C:\\a\\heichel-sw.js'));
	assert.ok(!isHeichelServiceWorker('/a/b/other-sw.js'));
	const stamped = versionServiceWorker('v=' + BUILD_TOKEN + ';', 'abc1234');
	assert.equal(stamped, 'v=abc1234;');
	assert.ok(!stamped.includes(BUILD_TOKEN));
});

test('build id is stable and non-empty within a process', () => {
	resetBuildIdForTests();
	const first = resolveBuildId();
	assert.ok(first.length > 0, 'build id must be non-empty');
	assert.equal(resolveBuildId(), first, 'build id must be process-stable');
	resetBuildIdForTests();
});

test('rendered templates travel compressed but stay no-cache', async () => {
	const html = '<html><head></head><body>' + 'x'.repeat(5000) + '</body></html>';
	const response = fakeResponse();
	await sendCompressedTemplate(
		{ dependencies: { request: { method: 'GET', headers: { 'accept-encoding': 'gzip, br' } }, response } },
		html
	);
	assert.equal(response.getHeader('cache-control'), 'no-cache');
	assert.equal(response.getHeader('content-encoding'), 'br');
	assert.equal(response.getHeader('vary'), 'Accept-Encoding');
	assert.ok(Number(response.getHeader('content-length')) < html.length / 2, 'brotli must shrink the template');
	const roundTrip = zlib.brotliDecompressSync(response.body).toString('utf8');
	assert.equal(roundTrip, html);
});

test('templates without an accepted encoding stay identity', async () => {
	const response = fakeResponse();
	await sendCompressedTemplate(
		{ dependencies: { request: { method: 'GET', headers: {} }, response } },
		'<html></html>'
	);
	assert.equal(response.getHeader('content-encoding'), undefined);
	assert.equal(response.body.toString('utf8'), '<html></html>');
});

test('text assets compress on the fly when no precompressed sibling exists', async () => {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-cache-test-'));
	const file = path.join(dir, 'widget.js');
	await fs.writeFile(file, 'var x = 1;\n'.repeat(2000));
	const { context, response } = staticContext({ filePath: file });
	const asset = await readStaticAsset(context);
	assert.equal(asset.handled, false);
	assert.equal(asset.encoding, 'br');
	assert.equal(response.getHeader('content-encoding'), 'br');
	assert.ok(response.getHeader('etag'), 'compressed asset must carry a validator');
	assert.equal(response.getHeader('vary'), 'Accept-Encoding');
	assert.ok(response.getHeader('cache-control').startsWith('public, max-age=0'));
	const roundTrip = zlib.brotliDecompressSync(asset.content).toString('utf8');
	assert.equal(roundTrip, 'var x = 1;\n'.repeat(2000));
	await fs.rm(dir, { recursive: true, force: true });
});

test('repeated loads of a compressed asset revalidate with 304', async () => {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-cache-test-'));
	const file = path.join(dir, 'panel.js');
	await fs.writeFile(file, 'var y = 2;\n'.repeat(2000));
	const first = staticContext({ filePath: file });
	await readStaticAsset(first.context);
	const etag = first.response.getHeader('etag');
	assert.ok(etag);
	const second = staticContext({ filePath: file, ifNoneMatch: etag });
	const asset = await readStaticAsset(second.context);
	assert.equal(asset.handled, true);
	assert.equal(second.response.statusCode, 304);
	assert.equal(second.response.body, null);
	await fs.rm(dir, { recursive: true, force: true });
});

test('binary assets are never compressed on the fly', async () => {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-cache-test-'));
	const file = path.join(dir, 'photo.png');
	await fs.writeFile(file, Buffer.alloc(5000, 7));
	const { context, response } = staticContext({ filePath: file, contentType: 'image/png', isBinary: true });
	const asset = await readStaticAsset(context);
	assert.equal(asset.encoding, 'identity');
	assert.equal(response.getHeader('content-encoding'), undefined);
	await fs.rm(dir, { recursive: true, force: true });
});

test('served service worker carries the live build id and no-cache', async () => {
	resetBuildIdForTests();
	const buildId = resolveBuildId();
	const { context, response } = staticContext({ filePath: SW_PATH });
	const asset = await readStaticAsset(context);
	assert.equal(asset.handled, false);
	assert.equal(response.getHeader('cache-control'), 'no-cache');
	assert.equal(response.getHeader('content-encoding'), 'br');
	const text = zlib.brotliDecompressSync(asset.content).toString('utf8');
	assert.ok(!text.includes(BUILD_TOKEN), 'placeholder must be stamped out');
	assert.ok(
		text.includes("const AWTSMOOS_BUILD_ID = '" + buildId + "';"),
		'worker source must carry the live build id so its bytes change every deploy'
	);
	resetBuildIdForTests();
});
