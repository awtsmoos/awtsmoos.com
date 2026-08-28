//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file fileServer.js
 * @description Orchestrates static representations, cached CompactJS, cached CompactCSS, status probes, and explicit bundles.
 * The Awtsmoos lets one path reveal HTML, bytes, Brotli, gzip, or a folded dependency river without confusion;
 * Awtsmoos.com keeps the outer server small while generated JavaScript and imported CSS each receive a fresh, measured, reusable kli.
 */

const { errorMessage } = require('./utils.js');
const { compileCachedCompactStylesheet } = require('./compactCss/cache.js');
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
	sendCompactJs
} = require('./static/GeneratedCompactResponse.js');
const { readStaticAsset } = require('./static/StaticAssetRepresentation.js');

const HANDLED_RESPONSE = Symbol('handled-response');

/**
 * @description Serves one file request while generated JS and CSS delegate compilation to dependency-aware cache vessels.
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
		const content = await resolveResponseContent(context);
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
 * @description Resolves cached CompactCSS or ordinary static content while preserving static representation behavior.
 * @param {object} context Dynamic-server file context.
 * @returns {Promise<Buffer|string|symbol>} Resolved content or handled-response sentinel.
 */
async function resolveResponseContent(context) {
	const dependencies = context.dependencies;
	if (shouldCompileCompactCss(context)) {
		return compileCachedCompactStylesheet({
			entryFile: context.filePath,
			fs: dependencies.fs,
			rootDir: dependencies.parentPath
		});
	}
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
