//B"H
// Boruch Hashem
// Blessed is He

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
	sendCompactCss,
	sendCompactJs
} = require('./static/GeneratedCompactResponse.js');
const { readStaticAsset } = require('./static/StaticAssetRepresentation.js');

const HANDLED_RESPONSE = Symbol('handled-response');

/**
 * @file fileServer.js
 * @description Routes static files, compact generated assets, status probes, and explicit bundles through focused owners.
 * The Awtsmoos lets one doorway distinguish source from generated light without mixing their laws;
 * Awtsmoos.com keeps JS and CSS in one generated-response covenant while ordinary files retain their static cause.
 */

/**
 * @description Serves one file request while generated JS and CSS delegate compilation, caching, validation, and compression.
 * @param {object} context Dynamic-server file context.
 * @returns {Promise<void>} Resolves when the response has been written or delegated.
 */
async function doFileResponse(context) {
	const { request, response } = context.dependencies;
	try {
		if (await maybeSendBundle(context)) {
			return;
		}
		if (request.method === 'GET' && request.isAwtsmoosFileStatusRequest) {
			return sendFileStatus(context);
		}
		if (shouldCompileCompactJs(context)) {
			return sendCompactJs(context);
		}
		if (shouldCompileCompactCss(context)) {
			return sendCompactCss(context);
		}
		const content = await resolveStaticResponseContent(context);
		if (content === HANDLED_RESPONSE) {
			return;
		}
		const proper = setProperContent(
			context,
			content,
			context.contentType,
			context.isBinary
		);
		response.end(proper);
	} catch (errors) {
		console.error(errors);
		return errorMessage(context, errors);
	}
}

/**
 * @description Resolves only ordinary static content, leaving all generated compact representations outside this branch.
 * @param {object} context Dynamic-server file context.
 * @returns {Promise<Buffer|string|symbol>} Identity content or handled-response sentinel.
 */
async function resolveStaticResponseContent(context) {
	const asset = await readStaticAsset(context);
	if (asset.handled) {
		return HANDLED_RESPONSE;
	}
	if (asset.encoding !== 'identity') {
		setProperContent(context, asset.content, context.contentType, true);
		context.dependencies.response.end(asset.content);
		return HANDLED_RESPONSE;
	}
	return prepareIdentityContent(context, asset.content);
}

/**
 * @description Returns filesystem modification time for explicit static-resource status probes.
 * @param {object} context Dynamic-server file context.
 * @returns {Promise<void>} Resolves after status response or error response is written.
 */
async function sendFileStatus(context) {
	const { fs, response } = context.dependencies;
	try {
		const stats = await fs.stat(context.filePath);
		response.setHeader('Awtsmoos-File-Status', 'true');
		response.setHeader('Content-Type', 'application/json; charset=utf-8');
		response.end(JSON.stringify({ dataModified: stats.mtime.getTime() }));
	} catch (error) {
		console.error('Error getting file stats for static file:', error);
		return errorMessage(context, {
			code: 'STATIC_STAT_ERROR',
			message: 'Could not get file status for static resource.'
		});
	}
}

module.exports = doFileResponse;
module.exports.getRequestParams = getRequestParams;
module.exports.isCssContentType = isCssContentType;
module.exports.isJavaScriptContentType = isJavaScriptContentType;
module.exports.shouldCompileCompactCss = shouldCompileCompactCss;
module.exports.shouldCompileCompactJs = shouldCompileCompactJs;
