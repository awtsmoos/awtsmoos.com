// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StaticAssetRepresentation.js
 * @description Loads one negotiated static representation and closes HEAD or validator hits early.
 * The Awtsmoos carries one complete file through the smallest truthful vessel;
 * Awtsmoos.com keeps template freshness, selected bytes, length, validators, and body suppression explicit.
 *
 * Two automatic laws were added for Heichel scale:
 * - The Heichel reader service worker is stamped with the running build id at
 *   serve time (ServiceWorkerVersioning), so every deploy changes its bytes and
 *   browsers pick up the new worker with zero manual version bumps.
 * - Text assets without a fresh precompressed (.br/.gz) sibling are compressed
 *   on the fly through the shared bounded compression cache, so Brotli/gzip is
 *   actually wired for page loads instead of existing only as negotiation code.
 */

const { createHash } = require('node:crypto');
const {
	cachePolicy,
	isNotModified,
	isTemplate,
	projectStaticHeaders,
	weakEtag
} = require('./StaticAssetHeaders.js');
const {
	selectStaticRepresentation
} = require('./StaticAssetNegotiation.js');
const {
	encodingChoices
} = require('./StaticAssetEncodingQuality.js');
const {
	generatedCompressionCache
} = require('./GeneratedCompressionCache.js');
const {
	isHeichelServiceWorker,
	versionServiceWorker
} = require('./ServiceWorkerVersioning.js');
const {
	resolveBuildId
} = require('./BuildIdentity.js');

/** Text vessels worth compressing on the fly; images/fonts/video stay untouched. */
const COMPRESSIBLE_CONTENT_TYPES = new Set([
	'application/javascript',
	'text/javascript',
	'application/json',
	'application/manifest+json',
	'text/css',
	'text/plain',
	'text/xml',
	'application/xml',
	'text/markdown',
	'image/svg+xml'
]);

async function readStaticAsset(context) {
	const { fs, request, response } = context.dependencies;
	if (isTemplate(context)) {
		response.setHeader('Cache-Control', 'no-cache');
		return identity(await fs.readFile(context.filePath));
	}
	if (isHeichelServiceWorker(context.filePath)) {
		return readVersionedServiceWorker(context);
	}
	const selected = await selectStaticRepresentation(
		fs,
		context.filePath,
		request.headers?.['accept-encoding']
	);
	if (selected.encoding === 'identity') {
		const onthefly = await maybeCompressOnTheFly(context);
		if (onthefly) return onthefly;
	}
	const stats = await fs.stat(selected.path);
	projectStaticHeaders(context, selected.encoding, stats);
	if (isNotModified(request, response.getHeader('ETag'))) {
		response.statusCode = 304;
		response.removeHeader?.('Content-Length');
		response.end();
		return handled();
	}
	if (request.method === 'HEAD') {
		response.end();
		return handled();
	}
	return {
		content: await fs.readFile(selected.path),
		encoding: selected.encoding,
		handled: false
	};
}

/**
 * @description Serves the Heichel reader worker stamped with the live build id.
 * The stamped bytes change on every deploy, so the browser's worker update check
 * installs the new worker and its activate handler purges stale caches — fully
 * automatic cache invalidation with no human remembering a version string.
 * @param {object} context Dynamic-server file context.
 * @returns {Promise<object>} Asset record for the versioned worker.
 */
async function readVersionedServiceWorker(context) {
	const { fs, request, response } = context.dependencies;
	const versioned = Buffer.from(
		versionServiceWorker(await fs.readFile(context.filePath, 'utf8'), resolveBuildId()),
		'utf8'
	);
	const stats = await fs.stat(context.filePath);
	const etag = `W/"sw-${createHash('sha256').update(versioned).digest('hex').slice(0, 16)}"`;
	response.setHeader('Cache-Control', 'no-cache');
	response.setHeader('Content-Type', 'application/javascript; charset=utf-8');
	response.setHeader('ETag', etag);
	response.setHeader('Last-Modified', stats.mtime.toUTCString());
	response.setHeader('Vary', 'Accept-Encoding');
	if (isNotModified(request, etag)) {
		response.statusCode = 304;
		response.end();
		return handled();
	}
	const best = encodingChoices(request.headers?.['accept-encoding'])[0];
	let body = versioned;
	let encoding = 'identity';
	if (best && (request.method === 'GET' || request.method === 'HEAD')) {
		body = await generatedCompressionCache.encode(versioned, best.encoding);
		encoding = best.encoding;
		response.setHeader('Content-Encoding', encoding);
	}
	response.setHeader('Content-Length', String(body.length));
	if (request.method === 'HEAD') {
		response.end();
		return handled();
	}
	return {
		content: body,
		encoding,
		handled: false
	};
}

/**
 * @description Compresses a text asset on the fly when no fresh precompressed
 * sibling exists, reusing the shared bounded cache so repeated loads of the
 * same bytes never recompress. Validators stay consistent per (file, encoding)
 * so conditional requests revalidate with 304 instead of refetching.
 * @param {object} context Dynamic-server file context.
 * @returns {Promise<object|null>} Compressed asset record, or null when compression does not apply.
 */
async function maybeCompressOnTheFly(context) {
	const { fs, request, response } = context.dependencies;
	if (request.method !== 'GET' && request.method !== 'HEAD') return null;
	if (context.isBinary) return null;
	if (!COMPRESSIBLE_CONTENT_TYPES.has(String(context.contentType || '').toLowerCase())) return null;
	const best = encodingChoices(request.headers?.['accept-encoding'])[0];
	if (!best) return null;
	const source = await fs.readFile(context.filePath);
	const stats = await fs.stat(context.filePath);
	const compressed = await generatedCompressionCache.encode(source, best.encoding);
	const etag = weakEtag(stats, best.encoding);
	response.setHeader('Content-Encoding', best.encoding);
	response.setHeader('Cache-Control', cachePolicy(context));
	response.setHeader('Content-Length', String(compressed.length));
	response.setHeader('Content-Type', context.contentType + '; charset=utf-8');
	response.setHeader('ETag', etag);
	response.setHeader('Last-Modified', stats.mtime.toUTCString());
	response.setHeader('Vary', 'Accept-Encoding');
	if (isNotModified(request, etag)) {
		response.statusCode = 304;
		response.removeHeader?.('Content-Length');
		response.end();
		return handled();
	}
	if (request.method === 'HEAD') {
		response.end();
		return handled();
	}
	return {
		content: compressed,
		encoding: best.encoding,
		handled: false
	};
}

function identity(content) {
	return {
		content,
		encoding: 'identity',
		handled: false
	};
}

function handled() {
	return {
		content: null,
		encoding: 'identity',
		handled: true
	};
}

module.exports = {
	readStaticAsset
};
