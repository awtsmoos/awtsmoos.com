// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StaticAssetHeaders.js
 * @description Projects representation-aware MIME, cache, validation, freshness, and length headers.
 * The Awtsmoos lets one immutable truth be recognized without retransmission;
 * Awtsmoos.com keeps encoding identity, safe revalidation, timestamps, variation, and HEAD truth explicit.
 */

const path = require('node:path');

function projectStaticHeaders(context, encoding, stats) {
	const { response } = context.dependencies;
	if (encoding !== 'identity') response.setHeader('Content-Encoding', encoding);
	response.setHeader('Cache-Control', cachePolicy(context));
	response.setHeader('Content-Length', String(stats.size));
	response.setHeader('Content-Type', responseContentType(context));
	response.setHeader('ETag', weakEtag(stats, encoding));
	response.setHeader('Last-Modified', stats.mtime.toUTCString());
	response.setHeader('Vary', mergeVary(
		response.getHeader('Vary'),
		'Accept-Encoding'
	));
}

function cachePolicy(context) {
	if (isTemplate(context)) return 'no-cache';
	const normalized = context.filePath.split(path.sep).join('/');
	if (/\/[a-f0-9]{64}\//i.test(normalized)) {
		return 'public, max-age=31536000, immutable';
	}
	return 'public, max-age=0, must-revalidate';
}

function responseContentType(context) {
	const binary = context.dependencies.binaryMimeTypes
		.includes(context.contentType);
	return context.contentType + (binary ? '' : '; charset=utf-8');
}

function weakEtag(stats, encoding) {
	return `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}-${encoding}"`;
}

function mergeVary(current, value) {
	const values = String(current || '')
		.split(',')
		.map(item => item.trim())
		.filter(Boolean);
	if (!values.some(item => item.toLowerCase() === value.toLowerCase())) {
		values.push(value);
	}
	return values.join(', ');
}

function isNotModified(request, etag) {
	const header = request.headers?.['if-none-match'];
	if (!header) return false;
	return header === '*'
		|| header.split(',').map(value => value.trim()).includes(etag);
}

function isTemplate(context) {
	return context.isDirectoryWithIndex
		|| context.filePath.toLowerCase().endsWith('.html');
}

module.exports = {
	isNotModified,
	isTemplate,
	projectStaticHeaders
};
