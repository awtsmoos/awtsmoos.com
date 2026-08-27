//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveMimePolicy
 * @description
 * The Awtsmoos lets each byte-vessel speak its honest type. Awtsmoos.com uses
 * conservative extension mapping and never defaults unknown files to JavaScript.
 */

const path = require('path');

const MIME_BY_EXTENSION = Object.freeze({
	'.css': 'text/css; charset=utf-8',
	'.csv': 'text/csv; charset=utf-8',
	'.gif': 'image/gif',
	'.glb': 'model/gltf-binary',
	'.gltf': 'model/gltf+json',
	'.html': 'text/html; charset=utf-8',
	'.ico': 'image/x-icon',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.mp3': 'audio/mpeg',
	'.mp4': 'video/mp4',
	'.pdf': 'application/pdf',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.txt': 'text/plain; charset=utf-8',
	'.wasm': 'application/wasm',
	'.webm': 'video/webm',
	'.webp': 'image/webp',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.xml': 'application/xml; charset=utf-8'
});

function mimeForPath(logicalPath, supplied) {
	const normalizedSupplied = String(supplied || '').trim().toLowerCase();
	if (isSafeMime(normalizedSupplied)) return normalizedSupplied;
	return MIME_BY_EXTENSION[path.extname(String(logicalPath || '')).toLowerCase()]
		|| 'application/octet-stream';
}

function isSafeMime(value) {
	return /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+;-]*(?:\s*;\s*charset=[a-z0-9_-]+)?$/i.test(value);
}

module.exports = {
	MIME_BY_EXTENSION,
	mimeForPath,
	isSafeMime
};
