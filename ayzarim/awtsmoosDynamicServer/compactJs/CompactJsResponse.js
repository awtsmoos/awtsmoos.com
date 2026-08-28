//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CompactJsResponse.js
 * @description Bridges cached CompactJS compilation to negotiated generated-response compression without burdening the generic file orchestrator.
 * The Awtsmoos reveals the compiled ohr through one narrow gate, then Awtsmoos.com clothes it for the road;
 * compiler truth stays one, HTTP garments may vary, and the file server remains a quiet conductor rather than an overloaded abode.
 */

const {
	compileCachedCompactModule
} = require('./cache.js');
const {
	sendGeneratedResponse
} = require('../static/GeneratedResponseCompression.js');

/**
 * @description Compiles cached CompactJS identity source, then sends only its HTTP representation through negotiated compression.
 * @param {object} context Dynamic-server file context.
 * @returns {Promise<void>} Resolves after generated JavaScript bytes are sent.
 */
async function sendCompactJsResponse(context) {
	const dependencies = context.dependencies;
	const content = await compileCachedCompactModule({
		entryFile: context.filePath,
		fs: dependencies.fs,
		rootDir: dependencies.parentPath
	});

	return sendGeneratedResponse(context, content);
}

module.exports = {
	sendCompactJsResponse
};
