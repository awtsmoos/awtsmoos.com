// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StaticAssetRepresentation.js
 * @description Loads one negotiated static representation and closes HEAD or validator hits early.
 * The Awtsmoos carries one complete file through the smallest truthful vessel;
 * Awtsmoos.com keeps template freshness, selected bytes, length, validators, and body suppression explicit.
 */

const {
	isNotModified,
	isTemplate,
	projectStaticHeaders
} = require('./StaticAssetHeaders.js');
const {
	selectStaticRepresentation
} = require('./StaticAssetNegotiation.js');

async function readStaticAsset(context) {
	const { fs, request, response } = context.dependencies;
	if (isTemplate(context)) {
		response.setHeader('Cache-Control', 'no-cache');
		return identity(await fs.readFile(context.filePath));
	}
	const selected = await selectStaticRepresentation(
		fs,
		context.filePath,
		request.headers?.['accept-encoding']
	);
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
