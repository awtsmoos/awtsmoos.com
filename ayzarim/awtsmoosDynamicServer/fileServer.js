//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file fileServer.js
 * @description Orchestrates static representations, generated CompactJS/CompactCSS responses, status probes, and explicit bundles.
 * The Awtsmoos lets one path reveal HTML, bytes, Brotli, gzip, or a folded dependency river without confusion;
 * Awtsmoos.com keeps this outer vessel small while generated code, imported style, and status truth each dwell in their own measured light.
 */

const { errorMessage } = require('./utils.js');
const { maybeSendBundle } = require('./zipBundles/bundleRoute.js');
const {
	prepareIdentityContent,
	setProperContent
} = require('./static/FileResponseContent.js');
const {
	getRequestParams,
	isCssContentType,
	isJavaScriptContentType,
	shouldCompileCompactCss,
	shouldCompileCompactJs
} = require('./static/FileResponseModes.js');
const {
	sendCompactCss
} = require('./static/GeneratedCompactCssResponse.js');
const {
	sendCompactJs
} = require('./static/GeneratedCompactResponse.js');
const {
	sendFileStatus
} = require('./static/StaticFileStatusResponse.js');
const { readStaticAsset } = require('./static/StaticAssetRepresentation.js');

const HANDLED_RESPONSE = Symbol('handled-response');

/**
 * @description Serves one file request while generated JS/CSS, status, bundles, and static bytes delegate to focused vessels.
 * @param {object} tiferesContext Dynamic-server file context.
 * @returns {Promise<void>} Resolves when the response has been written or delegated.
 */
async function doFileResponse(tiferesContext) {
	const { request, response } = tiferesContext.dependencies;
	try {
		if (await maybeSendBundle(tiferesContext)) {
			return;
		}
		if (request.method === 'GET' && request.isAwtsmoosFileStatusRequest) {
			return sendFileStatus(tiferesContext);
		}
		if (shouldCompileCompactJs(tiferesContext)) {
			return sendCompactJs(tiferesContext);
		}
		if (shouldCompileCompactCss(tiferesContext)) {
			return sendCompactCss(tiferesContext);
		}
		const malchusContent = await resolveStaticResponseContent(tiferesContext);
		if (malchusContent === HANDLED_RESPONSE) {
			return;
		}
		const yesodProper = setProperContent(
			tiferesContext,
			malchusContent,
			tiferesContext.contentType,
			tiferesContext.isBinary
		);
		response.end(yesodProper);
	} catch (errors) {
		console.error(errors);
		return errorMessage(tiferesContext, errors);
	}
}

/**
 * @description Resolves ordinary static content while preserving negotiated precompressed representation behavior.
 * @param {object} tiferesContext Dynamic-server file context.
 * @returns {Promise<Buffer|string|symbol>} Resolved content or handled-response sentinel.
 */
async function resolveStaticResponseContent(tiferesContext) {
	const malchusAsset = await readStaticAsset(tiferesContext);
	if (malchusAsset.handled) {
		return HANDLED_RESPONSE;
	}
	if (malchusAsset.encoding !== 'identity') {
		setProperContent(
			tiferesContext,
			malchusAsset.content,
			tiferesContext.contentType,
			true
		);
		tiferesContext.dependencies.response.end(malchusAsset.content);
		return HANDLED_RESPONSE;
	}
	return prepareIdentityContent(tiferesContext, malchusAsset.content);
}

module.exports = doFileResponse;
module.exports.getRequestParams = getRequestParams;
module.exports.isCssContentType = isCssContentType;
module.exports.isJavaScriptContentType = isJavaScriptContentType;
module.exports.shouldCompileCompactCss = shouldCompileCompactCss;
module.exports.shouldCompileCompactJs = shouldCompileCompactJs;
