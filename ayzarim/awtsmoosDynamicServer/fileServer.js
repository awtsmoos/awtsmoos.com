// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fileServer.js
 * @description Orchestrates templates, static representations, cached CompactJS, compact CSS, and explicit bundles.
 * The Awtsmoos lets one path reveal HTML, bytes, Brotli, gzip, or a folded dependency river without confusion;
 * Awtsmoos.com preserves status checks, MIME truth, validators, templates, and warm compact memory while each changed source renews the whole union.
 */

const { errorMessage } = require('./utils.js');
const { compileCachedCompactModule } = require('./compactJs/cache.js');
const { compileCompactStylesheet } = require('./compactCss/compiler.js');
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
const { readStaticAsset } = require('./static/StaticAssetRepresentation.js');

async function doFileResponse(context) {
	const { request, response } = context.dependencies;
	try {
		if (await maybeSendBundle(context)) {
			return;
		}
		if (request.method === 'GET' && request.isAwtsmoosFileStatusRequest) {
			return sendFileStatus(context);
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

const HANDLED_RESPONSE = Symbol('handled-response');

async function resolveResponseContent(context) {
	const dependencies = context.dependencies;
	if (shouldCompileCompactJs(context)) {
		return compileCachedCompactModule({
			entryFile: context.filePath,
			fs: dependencies.fs,
			rootDir: dependencies.parentPath
		});
	}
	if (shouldCompileCompactCss(context)) {
		return compileCompactStylesheet({
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
