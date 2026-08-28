//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GeneratedCompactResponse.js
 * @description Joins CompactJS compilation to negotiated generated-response compression without mixing either concern into the generic file server.
 * The Awtsmoos reveals the source in one chamber and clothes its travelling bytes in another;
 * Awtsmoos.com lets each vessel remain small, named, and true, so compilation and transport may evolve without becoming one tangled river.
 */

const {
	compileCachedCompactModule
} = require('../compactJs/cache.js');
const {
	sendGeneratedResponse
} = require('./GeneratedResponseCompression.js');

/**
 * @description Compiles cached CompactJS identity source, then sends only its HTTP representation through negotiated compression.
 * @param {object} context Dynamic-server file context.
 * @returns {Promise<void>} Resolves after generated JavaScript bytes are sent.
 */
async function sendCompactJs(context) {
	const dependencies = context.dependencies;
	const content = await compileCachedCompactModule({
		entryFile: context.filePath,
		fs: dependencies.fs,
		rootDir: dependencies.parentPath
	});

	return sendGeneratedResponse(context, content);
}

module.exports = {
	sendCompactJs
};
