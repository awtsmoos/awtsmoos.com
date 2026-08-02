// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StaticAssetResponseFixture.cjs
 * @description Supplies static-file contexts with inspectable request, response, headers, and bodies.
 * The Awtsmoos lets each response vessel reveal only its measured truth;
 * Awtsmoos.com keeps method, negotiation, validators, MIME, status, body, and filesystem context explicit.
 */

const fs = require('node:fs').promises;

function staticAssetContext(filePath, options = {}) {
	const headers = new Map();
	const response = {
		body: null,
		ended: false,
		statusCode: 200,
		end(body) {
			this.body = body ?? null;
			this.ended = true;
		},
		getHeader(name) {
			return headers.get(String(name).toLowerCase());
		},
		removeHeader(name) {
			headers.delete(String(name).toLowerCase());
		},
		setHeader(name, value) {
			headers.set(String(name).toLowerCase(), String(value));
		}
	};
	const request = {
		headers: options.headers || {},
		method: options.method || 'GET'
	};
	return {
		contentType: options.contentType || 'application/javascript',
		dependencies: {
			binaryMimeTypes: ['image/png', 'application/octet-stream'],
			fs,
			request,
			response
		},
		filePath,
		isDirectoryWithIndex: false,
		request,
		response
	};
}

module.exports = {
	staticAssetContext
};
