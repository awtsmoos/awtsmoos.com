// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StaticAssetHeaders.js
 * @description Projects representation-aware MIME, validators, and cache laws.
 * The Awtsmoos renews every mutable vessel without confusing it with an immutable name;
 * Awtsmoos.com lets true content addresses rest while living browser modules arrive fresh.
 */

const path = require('node:path');

const IMMUTABLE_POLICY = 'public, max-age=31536000, immutable';
const MUTABLE_STATIC_POLICY = 'public, max-age=0, s-maxage=60, stale-while-revalidate=30, stale-if-error=86400';

function projectStaticHeaders(context, encoding, stats) {
	const { response } = context.dependencies;
	if (encoding !== 'identity') response.setHeader('Content-Encoding', encoding);
	response.setHeader('Cache-Control', cachePolicy(context));
	response.setHeader('Content-Length', String(stats.size));
	response.setHeader('Content-Type', responseContentType(context));
	response.setHeader('ETag', weakEtag(stats, encoding));
	response.setHeader('Last-Modified', stats.mtime.toUTCString());
	response.setHeader('Vary', mergeVary(response.getHeader('Vary'), 'Accept-Encoding'));
}

/** Chooses freshness without allowing shared caches to mix mutable ESM releases. */
function cachePolicy(context) {
	if (isTemplate(context)) return 'no-cache';
	if (isContentAddressed(context)) return IMMUTABLE_POLICY;
	if (isPublicMutableModule(context)) return 'no-store';
	return MUTABLE_STATIC_POLICY;
}

/** True only for JavaScript modules living beneath the public geelooy tree. */
function isPublicMutableModule(context) {
	const normalized = normalizePath(context.filePath);
	return normalized.includes('/geelooy/')
		&& (normalized.endsWith('.js') || normalized.endsWith('.mjs'));
}

/** Recognizes immutable hash-path or hexadecimal ?v= content addresses. */
function isContentAddressed(context) {
	const normalized = normalizePath(context.filePath);
	if (/\/[a-f0-9]{64}\//i.test(normalized)) return true;
	const requestUrl = context.dependencies?.request?.url || '';
	return /(?:[?&])v=[a-f0-9]{8,}(?:&|$)/i.test(requestUrl);
}

function normalizePath(filePath = '') {
	return String(filePath).split(path.sep).join('/').replace(/\\/g, '/').toLowerCase();
}

function responseContentType(context) {
	const binary = context.dependencies.binaryMimeTypes.includes(context.contentType);
	return context.contentType + (binary ? '' : '; charset=utf-8');
}

function weakEtag(stats, encoding) {
	return `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}-${encoding}"`;
}

function mergeVary(current, value) {
	const values = String(current || '').split(',').map(item => item.trim()).filter(Boolean);
	if (!values.some(item => item.toLowerCase() === value.toLowerCase())) values.push(value);
	return values.join(', ');
}

function isNotModified(request, etag) {
	const header = request.headers?.['if-none-match'];
	if (!header) return false;
	return header === '*' || header.split(',').map(value => value.trim()).includes(etag);
}

function isTemplate(context) {
	return context.isDirectoryWithIndex || context.filePath.toLowerCase().endsWith('.html');
}

module.exports = {
	cachePolicy,
	isContentAddressed,
	isNotModified,
	isPublicMutableModule,
	isTemplate,
	projectStaticHeaders,
	weakEtag
};
