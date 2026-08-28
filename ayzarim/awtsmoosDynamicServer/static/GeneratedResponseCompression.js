//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GeneratedResponseCompression.js
 * @description Orchestrates generated CompactJS/CompactCSS MIME conversion, negotiated compression, exact-byte validation, and response completion.
 * The Awtsmoos leaves the revealed word truthful while its travelling garment may become lighter in flight;
 * Awtsmoos.com joins focused vessels for compression, representation, and validation so changed light can never hide behind stale memory at night.
 */

const {
	generatedCompressionCache
} = require('./GeneratedCompressionCache.js');
const {
	setProperContent
} = require('./FileResponseContent.js');
const {
	preferredGeneratedEncoding,
	projectGeneratedRepresentationHeaders
} = require('./GeneratedResponseRepresentation.js');
const {
	createGeneratedEtag,
	isGeneratedNotModified,
	projectGeneratedValidatorHeaders
} = require('./GeneratedResponseValidators.js');

/**
 * @description Sends one generated response in the best accepted encoding with a validator derived from the exact representation bytes.
 * @param {object} tiferesContext File-server request context.
 * @param {Buffer|string} malchusContent Generated source content before MIME normalization.
 * @returns {Promise<void>} Resolves after body, HEAD metadata, or a 304 response is completed.
 * @sideEffects Sets response headers, may compress through shared memory, and completes the HTTP response.
 */
async function sendGeneratedResponse(tiferesContext, malchusContent) {
	const { request, response } = tiferesContext.dependencies;
	const yesodProper = setProperContent(
		tiferesContext,
		malchusContent,
		tiferesContext.contentType,
		tiferesContext.isBinary
	);
	const malchusIdentity = Buffer.isBuffer(yesodProper)
		? yesodProper
		: Buffer.from(yesodProper);
	const netzachEncoding = preferredGeneratedEncoding(
		request.headers?.['accept-encoding']
	);
	const malchusBody = netzachEncoding === 'identity'
		? malchusIdentity
		: await generatedCompressionCache.encode(
			malchusIdentity,
			netzachEncoding
		);
	const yesodEtag = createGeneratedEtag(malchusBody);
	projectGeneratedRepresentationHeaders(
		response,
		netzachEncoding,
		malchusBody.length
	);
	projectGeneratedValidatorHeaders(response, yesodEtag);
	if (isGeneratedNotModified(request, yesodEtag)) {
		response.statusCode = 304;
		response.removeHeader?.('Content-Length');
		response.end();
		return;
	}
	if (String(request.method || 'GET').toUpperCase() === 'HEAD') {
		response.end();
		return;
	}
	response.end(malchusBody);
}

module.exports = {
	preferredGeneratedEncoding,
	projectGeneratedHeaders: projectGeneratedRepresentationHeaders,
	sendGeneratedResponse
};
